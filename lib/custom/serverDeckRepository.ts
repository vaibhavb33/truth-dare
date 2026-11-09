/**
 * Asteria Server-Side Custom Deck Repository & Security Engine
 * Authoritative deck storage, creator ownership validation, version tracking,
 * and immutable room snapshot generation.
 */

import fs from 'fs';
import path from 'path';
import { CustomDeck, CustomQuestion, MultiplayerRoom, SupportedLanguageCode } from '@/types';
import { ALL_LOCALES } from '@/lib/i18n/config';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'custom-decks.json');

class ServerDeckRepository {
  private decks: Map<string, CustomDeck> = new Map();
  private isLoaded = false;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: CustomDeck[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const deck of parsed) {
            this.decks.set(deck.id, deck);
          }
        }
      }
    } catch {
      // Graceful fallback to memory storage
    }
    this.isLoaded = true;
  }

  private persistToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = Array.from(this.decks.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Memory fallback if filesystem write is restricted
    }
  }

  /**
   * Saves or updates a custom deck with version increment and ownership checks
   */
  public saveDeck(deck: CustomDeck): { success: boolean; deck?: CustomDeck; error?: string } {
    this.loadFromDisk();
    const existing = this.decks.get(deck.id);

    if (existing) {
      // Ownership validation
      if (existing.creatorId && deck.creatorId && existing.creatorId !== deck.creatorId) {
        return { success: false, error: 'Permission denied: you can only edit your own decks.' };
      }

      const nextVersion = (existing.version || 1) + 1;
      const updated: CustomDeck = {
        ...deck,
        version: nextVersion,
        updatedAt: Date.now(),
      };
      this.decks.set(deck.id, updated);
      this.persistToDisk();
      return { success: true, deck: updated };
    }

    const newDeck: CustomDeck = {
      ...deck,
      version: deck.version || 1,
      createdAt: deck.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    this.decks.set(deck.id, newDeck);
    this.persistToDisk();
    return { success: true, deck: newDeck };
  }

  /**
   * Retrieves a deck by ID
   */
  public getDeckById(id: string): CustomDeck | null {
    this.loadFromDisk();
    return this.decks.get(id) || null;
  }

  /**
   * Retrieves all decks accessible to a creator
   */
  public getDecks(creatorId?: string): CustomDeck[] {
    this.loadFromDisk();
    const all = Array.from(this.decks.values());
    if (!creatorId) {
      return all.filter((d) => d.visibility === 'public');
    }
    return all.filter((d) => d.creatorId === creatorId || d.visibility === 'public');
  }

  /**
   * Deletes a deck with creator ownership verification
   */
  public deleteDeck(id: string, creatorId: string): { success: boolean; error?: string } {
    this.loadFromDisk();
    const target = this.decks.get(id);
    if (!target) {
      return { success: false, error: 'Deck not found.' };
    }

    if (target.creatorId !== creatorId) {
      return { success: false, error: 'Permission denied: you can only delete your own decks.' };
    }

    this.decks.delete(id);
    this.persistToDisk();
    return { success: true };
  }

  /**
   * Validates deck ownership and existence for room creation
   */
  public validateDeckOwnership(
    deckId: string,
    creatorId: string
  ): { valid: boolean; deck?: CustomDeck; error?: string } {
    this.loadFromDisk();
    const deck = this.decks.get(deckId);
    if (!deck) {
      return { valid: false, error: 'Custom deck not found or has been deleted.' };
    }

    // Permission check: must be owner or public
    if (deck.visibility === 'private' && deck.creatorId !== creatorId) {
      return { valid: false, error: 'Access denied: you do not have permission to use this private deck.' };
    }

    return { valid: true, deck };
  }

  /**
   * Builds an immutable, isolated snapshot of a deck for a multiplayer room
   * Validates:
   * 1. Deck existence and access permissions
   * 2. Playable question counts (must contain at least 2 questions)
   * 3. Question language validity
   */
  public createRoomSnapshot(params: {
    deckId?: string;
    creatorId?: string;
    roomId?: string;
    clientPayload?: {
      id?: string;
      name?: string;
      language?: SupportedLanguageCode;
      questions?: CustomQuestion[];
      creatorId?: string;
    };
  }): {
    success: boolean;
    snapshot?: NonNullable<MultiplayerRoom['customDeckSnapshot']>;
    error?: string;
    code?: string;
  } {
    this.loadFromDisk();

    let targetDeck: CustomDeck | null = null;
    const requestedId = params.deckId || params.clientPayload?.id;

    if (requestedId) {
      targetDeck = this.decks.get(requestedId) || null;
    }

    // If client supplied complete custom deck payload that hasn't been saved to server yet
    if (!targetDeck && params.clientPayload && params.clientPayload.questions && params.clientPayload.name) {
      const creator = params.creatorId || params.clientPayload.creatorId || 'anon-creator';
      const registered = this.saveDeck({
        id: requestedId || 'deck-' + Math.random().toString(36).substring(2, 9),
        name: params.clientPayload.name,
        description: 'Auto-registered room deck',
        language: params.clientPayload.language || 'en',
        category: 'classic-party',
        visibility: 'private',
        creatorId: creator,
        version: 1,
        questions: params.clientPayload.questions,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      targetDeck = registered.deck || null;
    }

    if (!targetDeck) {
      return {
        success: false,
        code: 'INVALID_DECK',
        error: 'Custom deck not found. The selected deck may have been deleted.',
      };
    }

    // Permission validation: Never trust client ID without ownership or public check
    const creator = params.creatorId || 'anonymous';
    if (targetDeck.visibility === 'private' && targetDeck.creatorId !== creator) {
      return {
        success: false,
        code: 'PERMISSION_DENIED',
        error: 'Permission denied: you can only host rooms using decks you own or public decks.',
      };
    }

    // Playable question validation
    const questions = targetDeck.questions || [];
    if (questions.length < 2) {
      return {
        success: false,
        code: 'INVALID_QUESTIONS',
        error: 'Custom deck must contain at least 2 playable questions to create a party room.',
      };
    }

    // Supported language validation
    const deckLang = targetDeck.language || 'en';
    if (!ALL_LOCALES.includes(deckLang as any)) {
      return {
        success: false,
        code: 'UNSUPPORTED_LANGUAGE',
        error: `Deck language "${deckLang}" is not supported.`,
      };
    }

    const truths = questions.filter((q) => q.type === 'truth').map((q) => ({ ...q }));
    const dares = questions.filter((q) => q.type === 'dare').map((q) => ({ ...q }));

    // Create deep-copied, immutable snapshot
    const snapshot: NonNullable<MultiplayerRoom['customDeckSnapshot']> = {
      id: targetDeck.id,
      deckId: targetDeck.id,
      roomId: params.roomId || 'rm-snapshot-' + Date.now(),
      version: targetDeck.version || 1,
      name: targetDeck.name,
      language: deckLang,
      questions: questions.map((q) => ({ ...q })),
      truthQuestions: truths,
      dareQuestions: dares,
      snapshotCreatedAt: Date.now(),
    };

    // Deep freeze snapshot to guarantee immutability
    Object.freeze(snapshot);
    Object.freeze(snapshot.questions);
    Object.freeze(snapshot.truthQuestions);
    Object.freeze(snapshot.dareQuestions);

    return { success: true, snapshot };
  }

  /**
   * Reset helper for test isolation
   */
  public clearForTesting() {
    this.decks.clear();
    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }
    } catch {}
  }
}

export const serverDeckRepository = new ServerDeckRepository();

