/**
 * Asteria Custom Deck Local Storage & Management Repository
 * Handles multi-deck library persistence, creator ownership, and legacy migrations.
 * Features hybrid storage (localStorage with automatic in-memory fallback for SSR & Vitest environments).
 */

import { CustomDeck, CustomQuestion, Question } from '@/types';
import { questionEngine } from '@/lib/questions/engine';

const STORAGE_KEY_DECKS = 'asteria_custom_decks';
const STORAGE_KEY_LEGACY = 'asteria_custom_deck';
const STORAGE_KEY_USER = 'asteria_user_id';

// Memory storage fallback for Node.js / Vitest / SSR environments
const memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {}
  }
  return memoryStorage[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
  memoryStorage[key] = value;
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  delete memoryStorage[key];
}

/**
 * Retrieves or establishes an anonymous persistent creator ID for the current browser
 */
export function getCreatorId(): string {
  let uid = getStorageItem(STORAGE_KEY_USER);
  if (!uid) {
    uid = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    setStorageItem(STORAGE_KEY_USER, uid);
  }
  return uid;
}

/**
 * Default starter deck created for new visitors
 */
function createDefaultStarterDeck(creatorId: string): CustomDeck {
  return {
    id: 'starter-deck-01',
    name: 'Party Inside Jokes',
    description: 'Custom icebreakers, group secrets, and dares for close friend circles.',
    language: 'en',
    category: 'classic-party',
    visibility: 'private',
    creatorId,
    questions: [
      { id: 'cd-1', type: 'truth', prompt: 'Who in our group has the most questionable dating history?' },
      { id: 'cd-2', type: 'dare', prompt: 'Let the group compose a text message to send to your most recent contact.' },
      { id: 'cd-3', type: 'truth', prompt: 'What is the biggest secret you kept from everyone in this room?' },
      { id: 'cd-4', type: 'dare', prompt: 'Do your best impression of the person who created this deck.' },
      { id: 'cd-5', type: 'truth', prompt: 'If you had to delete one person’s contact number forever, who is it?' },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Automatically migrates legacy single `asteria_custom_deck` into the modern `asteria_custom_decks` library
 */
function migrateLegacyDeck(creatorId: string): CustomDeck | null {
  try {
    const rawLegacy = getStorageItem(STORAGE_KEY_LEGACY);
    if (!rawLegacy) return null;

    const parsed = JSON.parse(rawLegacy);
    if (!parsed || (!parsed.name && !parsed.prompts)) return null;

    const questions: CustomQuestion[] = (parsed.prompts || []).map((p: any, idx: number) => ({
      id: p.id || `migrated-${idx}-${Date.now()}`,
      type: p.type === 'dare' ? 'dare' : 'truth',
      prompt: p.prompt || '',
      intensity: 3,
    }));

    const migratedDeck: CustomDeck = {
      id: 'migrated-' + Date.now(),
      name: parsed.name || 'Migrated Custom Deck',
      description: 'Preserved deck imported from legacy custom deck storage.',
      language: 'en',
      category: 'classic-party',
      visibility: 'private',
      creatorId,
      questions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Store in modern array
    const modernDecks = [migratedDeck];
    setStorageItem(STORAGE_KEY_DECKS, JSON.stringify(modernDecks));

    // Remove legacy key to prevent duplicate migrations
    removeStorageItem(STORAGE_KEY_LEGACY);

    return migratedDeck;
  } catch (err) {
    console.error('Error during custom deck legacy migration:', err);
    return null;
  }
}

/**
 * Custom Deck Storage API
 */
export const deckStorage = {
  /**
   * Resets internal memory store (useful for tests)
   */
  clear(): void {
    for (const k in memoryStorage) {
      delete memoryStorage[k];
    }
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        localStorage.clear();
      } catch {}
    }
  },

  /**
   * Test helper to set creator ID
   */
  setCreatorIdForTesting(id: string): void {
    setStorageItem(STORAGE_KEY_USER, id);
  },

  /**
   * Test helper to set legacy storage payload
   */
  setLegacyDeckForTesting(data: any): void {
    setStorageItem(STORAGE_KEY_LEGACY, JSON.stringify(data));
  },

  /**
   * Test helper to get legacy storage payload
   */
  getLegacyDeckForTesting(): string | null {
    return getStorageItem(STORAGE_KEY_LEGACY);
  },

  /**
   * Retrieves all custom decks owned by the user (or visible to them)
   */
  getDecks(): CustomDeck[] {
    const creatorId = getCreatorId();

    try {
      const raw = getStorageItem(STORAGE_KEY_DECKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check for legacy single deck migration
      const migrated = migrateLegacyDeck(creatorId);
      if (migrated) {
        return [migrated];
      }

      // Initialize default starter deck
      const starter = createDefaultStarterDeck(creatorId);
      setStorageItem(STORAGE_KEY_DECKS, JSON.stringify([starter]));
      return [starter];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves a single deck by ID
   */
  getDeckById(id: string): CustomDeck | null {
    const decks = this.getDecks();
    return decks.find((d) => d.id === id) || null;
  },

  /**
   * Saves or updates a custom deck with strict creator ownership checks
   */
  saveDeck(
    deckData: {
      id?: string;
      name: string;
      description?: string;
      language?: CustomDeck['language'];
      category?: CustomDeck['category'];
      visibility?: CustomDeck['visibility'];
      questions: CustomQuestion[];
    }
  ): { success: boolean; deck?: CustomDeck; error?: string } {
    const cleanName = (deckData.name || '').trim();
    if (!cleanName) {
      return { success: false, error: 'Deck name cannot be empty.' };
    }

    if (!deckData.questions || deckData.questions.length === 0) {
      return { success: false, error: 'Deck must contain at least one question.' };
    }

    const creatorId = getCreatorId();
    const decks = this.getDecks();

    let deckToSave: CustomDeck;

    if (deckData.id) {
      // Update existing deck
      const existingIdx = decks.findIndex((d) => d.id === deckData.id);
      if (existingIdx === -1) {
        return { success: false, error: 'Deck not found.' };
      }

      // Ownership enforcement
      const existingDeck = decks[existingIdx];
      if (existingDeck.creatorId !== creatorId) {
        return { success: false, error: 'Permission denied: you can only edit your own decks.' };
      }

      deckToSave = {
        ...existingDeck,
        name: cleanName,
        description: deckData.description?.trim() || '',
        language: deckData.language || existingDeck.language || 'en',
        category: deckData.category || existingDeck.category || 'classic-party',
        visibility: deckData.visibility || existingDeck.visibility || 'private',
        questions: deckData.questions,
        updatedAt: Date.now(),
      };

      decks[existingIdx] = deckToSave;
    } else {
      // Create new deck
      const newId = 'deck-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      deckToSave = {
        id: newId,
        name: cleanName,
        description: deckData.description?.trim() || '',
        language: deckData.language || 'en',
        category: deckData.category || 'classic-party',
        visibility: deckData.visibility || 'private',
        creatorId,
        questions: deckData.questions,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      decks.unshift(deckToSave);
    }

    try {
      setStorageItem(STORAGE_KEY_DECKS, JSON.stringify(decks));
      this.syncToQuestionEngine(deckToSave);
      return { success: true, deck: deckToSave };
    } catch {
      return { success: false, error: 'Failed to write to storage.' };
    }
  },

  /**
   * Deletes a custom deck with strict creator ownership verification
   */
  deleteDeck(id: string): { success: boolean; error?: string } {
    const creatorId = getCreatorId();
    const decks = this.getDecks();

    const targetDeck = decks.find((d) => d.id === id);
    if (!targetDeck) {
      return { success: false, error: 'Deck not found.' };
    }

    // Ownership enforcement
    if (targetDeck.creatorId !== creatorId) {
      return { success: false, error: 'Permission denied: you can only delete your own decks.' };
    }

    const updated = decks.filter((d) => d.id !== id);
    try {
      setStorageItem(STORAGE_KEY_DECKS, JSON.stringify(updated));
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update storage.' };
    }
  },

  /**
   * Injects the custom deck questions into Asteria's Question Engine for instant gameplay
   */
  syncToQuestionEngine(deck: CustomDeck) {
    if (!deck.questions || deck.questions.length === 0) return;

    const formatted: Question[] = deck.questions.map((q) => ({
      id: q.id,
      game_type: 'truth-or-dare',
      question_type: q.type,
      language_code: deck.language || 'en',
      category: 'custom',
      difficulty: (Math.max(1, Math.min(5, q.intensity || 3)) as 1 | 2 | 3 | 4 | 5),
      question_text: q.prompt,
      content_rating: 'PG-13',
      age_group: 'all-ages',
      is_active: true,
      safety_reviewed: true,
      created_at: new Date(deck.createdAt).toISOString(),
      tags: ['custom', deck.id],
      gameId: 'truth-or-dare',
      categoryId: 'custom',
      type: q.type,
      prompt: q.prompt,
      intensity: (Math.max(1, Math.min(5, q.intensity || 3)) as 1 | 2 | 3 | 4 | 5),
      isNsfw: false,
    }));

    questionEngine.addCustomQuestions(formatted);
  },
};
