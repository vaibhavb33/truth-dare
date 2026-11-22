import { describe, it, expect } from 'vitest';
import { runQuestionAudit } from '../scripts/validateQuestionDatabase';

describe('Question Database Quality and Integrity Audit', () => {
  const audit = runQuestionAudit();

  it('exceeds the 6,000+ total questions benchmark', () => {
    expect(audit.total).toBeGreaterThanOrEqual(6000);
  });

  it('satisfies Truth target of 1,000+', () => {
    expect(audit.byType['truth']).toBeGreaterThanOrEqual(1000);
  });

  it('satisfies Dare target of 1,000+', () => {
    expect(audit.byType['dare']).toBeGreaterThanOrEqual(1000);
  });

  it('satisfies Never Have I Ever target of 500+', () => {
    expect(audit.byType['never_have_i_ever']).toBeGreaterThanOrEqual(500);
  });

  it('satisfies Would You Rather target of 500+', () => {
    expect(audit.byType['would_you_rather']).toBeGreaterThanOrEqual(500);
  });

  it('satisfies Most Likely To target of 500+', () => {
    expect(audit.byType['most_likely_to']).toBeGreaterThanOrEqual(500);
  });

  it('satisfies This or That target of 500+', () => {
    expect(audit.byType['this_or_that']).toBeGreaterThanOrEqual(500);
  });

  it('satisfies Couples/Romantic target of 300+', () => {
    const romanticTotal = (audit.byCategory['romantic'] || 0) + (audit.byCategory['couples'] || 0);
    expect(romanticTotal).toBeGreaterThanOrEqual(300);
  });

  it('satisfies Friendship target of 300+', () => {
    expect(audit.byCategory['friendship']).toBeGreaterThanOrEqual(300);
  });

  it('satisfies Icebreaker target of 300+', () => {
    expect(audit.byCategory['icebreaker']).toBeGreaterThanOrEqual(300);
  });

  it('has zero exact duplicates across the entire platform', () => {
    expect(audit.exactDuplicates.length).toBe(0);
  });

  it('has zero structurally invalid questions', () => {
    expect(audit.invalidQuestions.length).toBe(0);
  });
});

