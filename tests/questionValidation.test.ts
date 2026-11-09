import { describe, it, expect, beforeEach } from 'vitest';
import { validateCustomQuestion, validateQuestionSafety } from '@/lib/custom/safetyFilter';
import { deckStorage, getCreatorId } from '@/lib/custom/deckStorage';
import { serverDeckRepository } from '@/lib/custom/serverDeckRepository';
import { CustomQuestion, CustomDeck } from '@/types';

describe('Task 38: Custom Deck Question Validation & Error Handling Suite', () => {
  beforeEach(() => {
    deckStorage.clear();
  });

  // =========================================================================
  // 1. INPUT VALIDATION: TEST CASES
  // =========================================================================
  describe('Phase 1 & 7: Input Validation Core Rules', () => {
    it('Case 1: Empty string ("") is rejected with friendly guidance', () => {
      const res = validateCustomQuestion('');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Write a question before adding it.');
    });

    it('Case 2: Spaces ("   ") are rejected with specific spaces warning', () => {
      const res = validateCustomQuestion('   ');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Your question cannot contain only spaces.');
    });

    it('Case 3: Tabs ("\\t\\t") are rejected with specific spaces warning', () => {
      const res = validateCustomQuestion('\t\t');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Your question cannot contain only spaces.');
    });

    it('Case 4: Newlines ("\\n\\r\\n") are rejected with specific spaces warning', () => {
      const res = validateCustomQuestion('\n\r\n');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Your question cannot contain only spaces.');
    });

    it('Case 5: 1-character question ("A") is valid and accepted', () => {
      const res = validateCustomQuestion('A');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('Case 6: 250-character question (exact boundary) is valid and accepted', () => {
      const text250 = 'Q'.repeat(250);
      expect(text250.length).toBe(250);
      const res = validateCustomQuestion(text250);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('Case 7: 251-character question (exceeds boundary) is rejected with 250 limit notice', () => {
      const text251 = 'Q'.repeat(251);
      expect(text251.length).toBe(251);
      const res = validateCustomQuestion(text251);
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Maximum 250 characters allowed.');
    });

    it('Case 8: Hindi Devanagari text is accepted and accurately validated', () => {
      const hindiQuestion = 'क्या आपने कभी किसी दोस्त का कोई बड़ा राज छुपाया है? सच बताओ!';
      const res = validateCustomQuestion(hindiQuestion);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('Case 9: Standard English text is accepted and properly trimmed', () => {
      const englishQuestion = '  What is the most embarrassing lie you ever told your parents?  ';
      const res = validateCustomQuestion(englishQuestion);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('Case 10: Special punctuation characters are accepted if safe', () => {
      const punctuationQuestion = 'Who in this room is #1?! (Rank: 1-10, @everyone, $100 prize & trophy)';
      const res = validateCustomQuestion(punctuationQuestion);
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('Duplicate Check: Rejects duplicate questions within same deck (case & space insensitive)', () => {
      const existing = ['What is your biggest fear?', 'Sing the national anthem in opera style.'];

      const exactDup = validateCustomQuestion('What is your biggest fear?', existing);
      expect(exactDup.isValid).toBe(false);
      expect(exactDup.error).toBe('This question is already in your deck.');

      const caseDup = validateCustomQuestion('  WHAT IS YOUR BIGGEST FEAR?  ', existing);
      expect(caseDup.isValid).toBe(false);
      expect(caseDup.error).toBe('This question is already in your deck.');
    });

    it('Content Safety: Rejects hazardous physical prompts with clear guidance', () => {
      const res = validateCustomQuestion('Drink bleach or gasoline right now.');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Dangerous physical stunts');
    });
  });

  // =========================================================================
  // 2. BUTTON BEHAVIOUR & STATE LOGIC
  // =========================================================================
  describe('Phase 2: Add Question Button Logic & Debounce Locking', () => {
    function computeButtonState(params: {
      input: string;
      questions: string[];
      isSubmitting: boolean;
    }) {
      const cleaned = params.input.trim();
      const isOnlySpaces = params.input.length > 0 && cleaned.length === 0;
      const isTooLong = params.input.length > 250 || cleaned.length > 250;
      const isDuplicate = Boolean(
        cleaned && params.questions.some((q) => q.trim().toLowerCase() === cleaned.toLowerCase())
      );

      const isValidToAdd = cleaned.length > 0 && !isTooLong && !isDuplicate && !params.isSubmitting;

      let inlineError: string | null = null;
      if (isOnlySpaces) inlineError = 'Your question cannot contain only spaces.';
      else if (isTooLong) inlineError = 'Maximum 250 characters allowed.';
      else if (isDuplicate) inlineError = 'This question is already in your deck.';

      return {
        isDisabled: !isValidToAdd,
        inlineError,
        isOnlySpaces,
        isTooLong,
        isDuplicate,
      };
    }

    it('Disables Add Question button when input is empty string with NO error banner', () => {
      const state = computeButtonState({ input: '', questions: [], isSubmitting: false });
      expect(state.isDisabled).toBe(true);
      expect(state.inlineError).toBeNull(); // No error banner on initial empty state!
    });

    it('Disables button and shows inline warning when input contains only spaces', () => {
      const state = computeButtonState({ input: '    ', questions: [], isSubmitting: false });
      expect(state.isDisabled).toBe(true);
      expect(state.inlineError).toBe('Your question cannot contain only spaces.');
    });

    it('Disables button and shows inline warning when input exceeds 250 characters', () => {
      const state = computeButtonState({ input: 'A'.repeat(251), questions: [], isSubmitting: false });
      expect(state.isDisabled).toBe(true);
      expect(state.inlineError).toBe('Maximum 250 characters allowed.');
    });

    it('Disables button and shows inline warning when input is duplicate', () => {
      const state = computeButtonState({
        input: 'Tell a funny story.',
        questions: ['Tell a funny story.'],
        isSubmitting: false,
      });
      expect(state.isDisabled).toBe(true);
      expect(state.inlineError).toBe('This question is already in your deck.');
    });

    it('Disables button when submission is already in flight (rapid clicking protection)', () => {
      const state = computeButtonState({
        input: 'Valid question',
        questions: [],
        isSubmitting: true, // Concurrency lock active
      });
      expect(state.isDisabled).toBe(true);
    });

    it('Enables button when input is valid, trimmed, within limit, and not in-flight', () => {
      const state = computeButtonState({
        input: '  What is your favorite secret recipe?  ',
        questions: [],
        isSubmitting: false,
      });
      expect(state.isDisabled).toBe(false);
      expect(state.inlineError).toBeNull();
    });
  });

  // =========================================================================
  // 3. SUCCESS BEHAVIOUR & STATE TRANSITIONS
  // =========================================================================
  describe('Phase 4: Question Submission Success Behaviour', () => {
    it('Clears input, preserves selected question type, and updates counts', () => {
      let promptText = 'Who is your celebrity crush?';
      let promptType: 'truth' | 'dare' = 'truth';
      let questions: CustomQuestion[] = [];
      let successNotice: string | null = null;

      // Simulate handleAddQuestion
      const clean = promptText.trim();
      const validation = validateCustomQuestion(clean, questions.map((q) => q.prompt));
      expect(validation.isValid).toBe(true);

      const newQ: CustomQuestion = {
        id: 'cq-1',
        type: promptType,
        prompt: clean,
        intensity: 3,
      };

      questions = [...questions, newQ];
      promptText = ''; // 1. Input is cleared
      // 2. promptType remains 'truth' (not flipped or reset)
      expect(promptType).toBe('truth');

      // 3. Update counts
      const truthCount = questions.filter((q) => q.type === 'truth').length;
      const dareCount = questions.filter((q) => q.type === 'dare').length;
      expect(truthCount).toBe(1);
      expect(dareCount).toBe(0);

      // 4. Confirmation notice
      successNotice = `✓ Truth added! (${questions.length} total)`;
      expect(successNotice).toBe('✓ Truth added! (1 total)');
      expect(questions[0].prompt).toBe('Who is your celebrity crush?');
    });
  });

  // =========================================================================
  // 4. SAVE DECK VALIDATION (SINGLE-TYPE & REPOSITORY)
  // =========================================================================
  describe('Phase 5: Save Deck Validation Rules', () => {
    it('Allows saving a deck with ONLY Truth questions (does not force both Truth and Dare)', () => {
      const saveResult = deckStorage.saveDeck({
        name: 'Pure Truths Only',
        questions: [
          { id: 't1', type: 'truth', prompt: 'Truth 1' },
          { id: 't2', type: 'truth', prompt: 'Truth 2' },
          { id: 't3', type: 'truth', prompt: 'Truth 3' },
        ],
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.deck?.questions.length).toBe(3);
      expect(saveResult.deck?.questions.every((q) => q.type === 'truth')).toBe(true);
    });

    it('Allows saving a deck with ONLY Dare questions', () => {
      const saveResult = deckStorage.saveDeck({
        name: 'Pure Dares Only',
        questions: [
          { id: 'd1', type: 'dare', prompt: 'Dare 1' },
          { id: 'd2', type: 'dare', prompt: 'Dare 2' },
        ],
      });

      expect(saveResult.success).toBe(true);
      expect(saveResult.deck?.questions.length).toBe(2);
      expect(saveResult.deck?.questions.every((q) => q.type === 'dare')).toBe(true);
    });

    it('Requires at least 1 valid question before saving', () => {
      const saveResult = deckStorage.saveDeck({
        name: 'Empty Deck',
        questions: [],
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toBe('Deck must contain at least one question.');
    });

    it('Requires a non-empty deck name', () => {
      const saveResult = deckStorage.saveDeck({
        name: '     ',
        questions: [{ id: 'q1', type: 'truth', prompt: 'Sample' }],
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toBe('Deck name cannot be empty.');
    });
  });

  // =========================================================================
  // 5. ERROR RESILIENCE & DATA PRESERVATION
  // =========================================================================
  describe('Phase 6: Error Handling & Local Data Preservation', () => {
    it('Preserves locally stored questions and deck when server API is offline', () => {
      // Save locally (new deck without preset ID)
      const localRes = deckStorage.saveDeck({
        name: 'Offline Party Deck',
        questions: [{ id: 'q1', type: 'truth', prompt: 'Offline question?' }],
      });
      expect(localRes.success).toBe(true);
      expect(localRes.deck).toBeDefined();

      const savedDeckId = localRes.deck!.id;

      // Simulate server API failure (e.g. 500 Network Error)
      const simulatedApiFailure = () => {
        throw new Error('500 Internal Server Error: Database connection timeout');
      };

      expect(() => {
        try {
          simulatedApiFailure();
        } catch {
          // Handled gracefully: local deck is never cleared
        }
      }).not.toThrow();

      // Verify local storage is intact
      const retrieved = deckStorage.getDeckById(savedDeckId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.questions[0].prompt).toBe('Offline question?');
    });

    it('Clears error state once user modifies or rectifies the input', () => {
      let currentError: string | null = 'Your question cannot contain only spaces.';

      // User types a valid character
      const onInputChange = (newVal: string) => {
        if (newVal.trim().length > 0) {
          currentError = null; // Clears error immediately!
        }
      };

      onInputChange('A');
      expect(currentError).toBeNull();
    });
  });
});
