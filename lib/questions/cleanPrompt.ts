/**
 * Play Truth & Dare — Question Prompt Cleaner Utility
 *
 * Strips visible question, challenge, truth, and dare numbering patterns from
 * display and speech text while preserving underlying question identifiers
 * and genuine question punctuation (e.g. "Who in this room is #1?!").
 */

/**
 * Removes visible numbering formats from question prompts, such as:
 * - "(Challenge #117)", "(Challenge #25)"
 * - "Challenge #25", "Challenge #117:"
 * - "(Truth #45)", "(Dare #89)"
 * - "Truth #45", "Dare #89"
 * - "(Rodada #34)", "(Desafío #135)", "(Pregunta #12)"
 * - "(#117)", "#117"
 *
 * @param text The raw question or challenge prompt string.
 * @returns Cleaned natural prompt string without numbering artifacts.
 */
export function cleanQuestionPrompt(text: string | null | undefined): string {
  if (!text) return '';

  return text
    // 1. Remove parenthetical challenge/question/truth/dare/rodada/desafío numbering
    // e.g. " (Challenge #117)", " (Truth #45)", " (Dare #89)", " (Rodada #34)", " (#117)"
    .replace(/\s*\((?:(?:Challenge|Truth|Dare|Question|Pregunta|Desafío|Desafio|Rodada|Ronda)\s*)?#\s*\d+\)/gi, '')
    // 2. Remove trailing challenge/truth/dare numbering with optional delimiter
    // e.g. " - Challenge #25", " Challenge #25", " Truth #45", " Dare #89"
    .replace(/(?:\s*[-–—:]\s*|\s+)(?:Challenge|Truth|Dare|Question|Pregunta|Desafío|Desafio|Rodada|Ronda)\s*#\s*\d+$/gi, '')
    // 3. Remove leading challenge/truth/dare numbering
    // e.g. "Challenge #25: ", "Truth #45 - ", "Dare #89: "
    .replace(/^(?:Challenge|Truth|Dare|Question|Pregunta|Desafío|Desafio|Rodada|Ronda)\s*#\s*\d+\s*[:\-–—]?\s*/gi, '')
    .trim();
}

/**
 * Sanitizes a Question object's prompt and question_text properties
 * while strictly preserving its id, category, tags, and all other metadata.
 */
export function cleanQuestion<T extends { prompt?: string; question_text?: string }>(question: T): T;
export function cleanQuestion<T extends { prompt?: string; question_text?: string }>(question: T | null): T | null;
export function cleanQuestion<T extends { prompt?: string; question_text?: string }>(question: T | null | undefined): T | null | undefined;
export function cleanQuestion<T extends { prompt?: string; question_text?: string }>(question: T | null | undefined): T | null | undefined {
  if (!question) return question;
  return {
    ...question,
    prompt: question.prompt ? cleanQuestionPrompt(question.prompt) : question.prompt,
    question_text: question.question_text ? cleanQuestionPrompt(question.question_text) : question.question_text,
  };
}
