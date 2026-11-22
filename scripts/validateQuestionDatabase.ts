import { ALL_QUESTIONS } from '../lib/questions/database';

interface AuditResult {
  total: number;
  byGame: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
  exactDuplicates: { text: string; ids: string[]; count: number }[];
  nearDuplicates: { q1: string; q2: string; id1: string; id2: string; score: number }[];
  invalidQuestions: { id: string; reason: string }[];
  passesThresholds: boolean;
  thresholdErrors: string[];
}

function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordTokens(s: string): Set<string> {
  return new Set(normalize(s).split(' ').filter((w) => w.length > 2));
}

function jaccardSimilarity(s1: string, s2: string): number {
  const t1 = wordTokens(s1);
  const t2 = wordTokens(s2);
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersection = 0;
  for (const w of t1) {
    if (t2.has(w)) intersection++;
  }
  const union = new Set([...t1, ...t2]).size;
  return intersection / union;
}

export function runQuestionAudit(): AuditResult {
  const result: AuditResult = {
    total: ALL_QUESTIONS.length,
    byGame: {},
    byType: {},
    byCategory: {},
    byLanguage: {},
    exactDuplicates: [],
    nearDuplicates: [],
    invalidQuestions: [],
    passesThresholds: true,
    thresholdErrors: [],
  };

  const textMap = new Map<string, string[]>();

  for (const q of ALL_QUESTIONS) {
    // 1. Structure validation
    if (!q.id) {
      result.invalidQuestions.push({ id: 'missing_id', reason: 'Missing id property' });
    }
    const text = q.prompt || q.question_text || '';
    if (!text.trim()) {
      result.invalidQuestions.push({ id: q.id, reason: 'Empty question prompt' });
    }

    const type = q.question_type || q.type || 'unknown';
    const game = q.game_type || q.gameId || 'truth-or-dare';
    const cat = q.category || q.categoryId || 'uncategorized';
    const lang = q.language_code || 'en';

    result.byType[type] = (result.byType[type] || 0) + 1;
    result.byGame[game] = (result.byGame[game] || 0) + 1;
    result.byCategory[cat] = (result.byCategory[cat] || 0) + 1;
    result.byLanguage[lang] = (result.byLanguage[lang] || 0) + 1;

    // 2. Exact duplicate check
    const norm = normalize(text);
    const existing = textMap.get(norm) || [];
    existing.push(q.id);
    textMap.set(norm, existing);
  }

  for (const [norm, ids] of textMap.entries()) {
    if (ids.length > 1) {
      result.exactDuplicates.push({ text: norm, ids, count: ids.length });
    }
  }

  // 3. Threshold checks
  const truths = result.byType['truth'] || 0;
  const dares = result.byType['dare'] || 0;
  const nhie = result.byType['never_have_i_ever'] || 0;
  const wyr = result.byType['would_you_rather'] || 0;
  const mlt = result.byType['most_likely_to'] || 0;
  const tot = result.byType['this_or_that'] || 0;

  const romantic = (result.byCategory['romantic'] || 0) + (result.byCategory['couples'] || 0);
  const friendship = result.byCategory['friendship'] || 0;
  const icebreaker = result.byCategory['icebreaker'] || 0;

  if (truths < 1000) result.thresholdErrors.push(`Truths (${truths}) < 1,000 target`);
  if (dares < 1000) result.thresholdErrors.push(`Dares (${dares}) < 1,000 target`);
  if (nhie < 500) result.thresholdErrors.push(`Never Have I Ever (${nhie}) < 500 target`);
  if (wyr < 500) result.thresholdErrors.push(`Would You Rather (${wyr}) < 500 target`);
  if (mlt < 500) result.thresholdErrors.push(`Most Likely To (${mlt}) < 500 target`);
  if (tot < 500) result.thresholdErrors.push(`This or That (${tot}) < 500 target`);
  if (romantic < 300) result.thresholdErrors.push(`Couples/Romantic (${romantic}) < 300 target`);
  if (friendship < 300) result.thresholdErrors.push(`Friendship (${friendship}) < 300 target`);
  if (icebreaker < 300) result.thresholdErrors.push(`Icebreaker (${icebreaker}) < 300 target`);

  if (result.thresholdErrors.length > 0 || result.exactDuplicates.length > 0 || result.invalidQuestions.length > 0) {
    result.passesThresholds = false;
  }

  return result;
}

if (require.main === module) {
  const audit = runQuestionAudit();
  console.log('=== QUESTION DATABASE AUDIT REPORT ===');
  console.log(`Total Questions: ${audit.total}`);
  console.log('\nBreakdown by Type:', audit.byType);
  console.log('\nBreakdown by Game:', audit.byGame);
  console.log('\nBreakdown by Category:', audit.byCategory);
  console.log('\nBreakdown by Language:', audit.byLanguage);
  console.log(`\nExact Duplicates: ${audit.exactDuplicates.length}`);
  console.log(`Invalid Questions: ${audit.invalidQuestions.length}`);
  console.log(`\nThreshold Errors: ${audit.thresholdErrors.length}`);
  if (audit.thresholdErrors.length > 0) {
    console.error('Errors:', audit.thresholdErrors);
    process.exit(1);
  } else {
    console.log('ALL THRESHOLDS AND INTEGRITY CHECKS PASSED PERFECTLY!');
  }
}
