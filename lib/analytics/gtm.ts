/**
 * Play Truth & Dare — Official Google Tag Manager & DataLayer Client
 * Container ID: GTM-MNXM9MQK
 * Domain: https://playtruthndare.com
 */

export const GTM_ID = 'GTM-MNXM9MQK';

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

/**
 * Safe utility to push events to window.dataLayer
 */
export function pushToDataLayer(eventData: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(eventData);
}

// ---------------------------------------------------------------------------
// Typed Event Payloads (Strictly Anonymized — Zero PII / Private Content)
// ---------------------------------------------------------------------------

export interface PageViewPayload {
  path: string;
  url?: string;
  title?: string;
  locale?: string;
}

export interface GameStartedPayload {
  game_id: string;
  game_name: string;
  mode?: 'solo' | 'pass_and_play' | 'multiplayer';
}

export interface CardSelectionPayload {
  category?: string;
  language?: string;
}

export interface SpinnerUsedPayload {
  slice_count: number;
  duration_ms?: number;
}

export interface CustomDeckCreatedPayload {
  question_count: number;
  language?: string;
}

export interface CustomQuestionAddedPayload {
  type: 'truth' | 'dare';
  language?: string;
}

export interface RoomActionPayload {
  game_type?: string;
}

export interface GameCompletedPayload {
  game_id: string;
  rounds_played?: number;
}

export interface LanguageChangedPayload {
  from_locale: string;
  to_locale: string;
}

export interface PwaInstallClickedPayload {
  source: string;
}

// ---------------------------------------------------------------------------
// Event Dispatchers
// ---------------------------------------------------------------------------

/**
 * 1. SPA Route Navigation
 */
export function trackPageView({ path, url, title, locale }: PageViewPayload): void {
  pushToDataLayer({
    event: 'page_view',
    page_path: path,
    page_location: url || (typeof window !== 'undefined' ? window.location.href : undefined),
    page_title: title || (typeof document !== 'undefined' ? document.title : undefined),
    page_locale: locale,
  });
}

/**
 * 2. Game Session Started
 */
export function trackGameStarted({ game_id, game_name, mode = 'solo' }: GameStartedPayload): void {
  pushToDataLayer({
    event: 'game_started',
    game_id,
    game_name,
    game_mode: mode,
  });
}

/**
 * 3. Truth Card Selected (Prompt text is NEVER tracked)
 */
export function trackTruthSelected({ category, language }: CardSelectionPayload = {}): void {
  pushToDataLayer({
    event: 'truth_selected',
    card_type: 'truth',
    category,
    language,
  });
}

/**
 * 4. Dare Card Selected (Prompt text is NEVER tracked)
 */
export function trackDareSelected({ category, language }: CardSelectionPayload = {}): void {
  pushToDataLayer({
    event: 'dare_selected',
    card_type: 'dare',
    category,
    language,
  });
}

/**
 * 5. Spinner Wheel Used (Player names are NEVER tracked)
 */
export function trackSpinnerUsed({ slice_count, duration_ms }: SpinnerUsedPayload): void {
  pushToDataLayer({
    event: 'spinner_used',
    slice_count,
    duration_ms,
  });
}

/**
 * 6. Custom Deck Created (Deck title & questions are NEVER tracked)
 */
export function trackCustomDeckCreated({ question_count, language }: CustomDeckCreatedPayload): void {
  pushToDataLayer({
    event: 'custom_deck_created',
    question_count,
    language,
  });
}

/**
 * 7. Custom Question Added (Question text is NEVER tracked)
 */
export function trackCustomQuestionAdded({ type, language }: CustomQuestionAddedPayload): void {
  pushToDataLayer({
    event: 'custom_question_added',
    question_type: type,
    language,
  });
}

/**
 * 8. Multiplayer Room Created (Room code & host name are NEVER tracked)
 */
export function trackRoomCreated({ game_type = 'truth-or-dare' }: RoomActionPayload = {}): void {
  pushToDataLayer({
    event: 'room_created',
    game_type,
  });
}

/**
 * 9. Multiplayer Room Joined (Room code & player name are NEVER tracked)
 */
export function trackRoomJoined({ game_type = 'truth-or-dare' }: RoomActionPayload = {}): void {
  pushToDataLayer({
    event: 'room_joined',
    game_type,
  });
}

/**
 * 10. Game Session Completed
 */
export function trackGameCompleted({ game_id, rounds_played = 0 }: GameCompletedPayload): void {
  pushToDataLayer({
    event: 'game_completed',
    game_id,
    rounds_played,
  });
}

/**
 * 11. Platform Language Changed
 */
export function trackLanguageChanged({ from_locale, to_locale }: LanguageChangedPayload): void {
  pushToDataLayer({
    event: 'language_changed',
    from_locale,
    to_locale,
  });
}

/**
 * 12. PWA Install Action Clicked
 */
export function trackPwaInstallClicked({ source }: PwaInstallClickedPayload): void {
  pushToDataLayer({
    event: 'pwa_install_clicked',
    install_source: source,
  });
}

