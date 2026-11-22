import { describe, it } from 'vitest';
import { ALL_QUESTIONS } from '@/lib/questions/database';
import { findDuplicateQuestions } from '@/lib/questions/database';

describe('Database Audit', () => {
  it('calculates comprehensive database statistics', () => {
    console.log('--- DATABASE AUDIT START ---');
    console.log('Total ALL_QUESTIONS:', ALL_QUESTIONS.length);

    const byGame: Record<string, number> = {};
    const byLang: Record<string, number> = {};
    const byCat: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const byGameAndLang: Record<string, Record<string, number>> = {};

    for (const q of ALL_QUESTIONS) {
      const g = q.game_type || q.gameId || 'unknown';
      byGame[g] = (byGame[g] || 0) + 1;

      const l = q.language_code || 'en';
      byLang[l] = (byLang[l] || 0) + 1;

      const c = (q.category || q.categoryId || 'unknown') as string;
      byCat[c] = (byCat[c] || 0) + 1;

      const t = (q.question_type || q.type || 'unknown') as string;
      byType[t] = (byType[t] || 0) + 1;

      if (!byGameAndLang[g]) byGameAndLang[g] = {};
      byGameAndLang[g][l] = (byGameAndLang[g][l] || 0) + 1;
    }

    console.log('QUESTIONS BY GAME:\n', JSON.stringify(byGame, null, 2));
    console.log('QUESTIONS BY LANGUAGE:\n', JSON.stringify(byLang, null, 2));
    console.log('QUESTIONS BY CATEGORY:\n', JSON.stringify(byCat, null, 2));
    console.log('QUESTIONS BY TYPE:\n', JSON.stringify(byType, null, 2));
    console.log('QUESTIONS BY GAME AND LANGUAGE:\n', JSON.stringify(byGameAndLang, null, 2));

    const duplicates = findDuplicateQuestions();
    console.log('TOTAL DUPLICATES FOUND:', duplicates.length);
    console.log('--- DATABASE AUDIT END ---');
  });
});

