import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  GTM_ID,
  pushToDataLayer,
  trackPageView,
  trackGameStarted,
  trackTruthSelected,
  trackDareSelected,
  trackSpinnerUsed,
  trackCustomDeckCreated,
  trackCustomQuestionAdded,
  trackRoomCreated,
  trackRoomJoined,
  trackGameCompleted,
  trackLanguageChanged,
  trackPwaInstallClicked,
} from '@/lib/analytics/gtm';

describe('Google Tag Manager & DataLayer Implementation', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('uses the exact official GTM container ID GTM-MNXM9MQK', () => {
    expect(GTM_ID).toBe('GTM-MNXM9MQK');
  });

  it('safely pushes events to window.dataLayer', () => {
    pushToDataLayer({ event: 'test_event', test_prop: 'val' });
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toEqual({ event: 'test_event', test_prop: 'val' });
  });

  it('tracks SPA page_view with path, location, and title', () => {
    trackPageView({
      path: '/games/truth-or-dare',
      url: 'https://playtruthndare.com/games/truth-or-dare',
      title: 'Truth or Dare Online',
      locale: 'en',
    });

    const event = window.dataLayer?.find((e) => e.event === 'page_view');
    expect(event).toBeDefined();
    expect(event?.page_path).toBe('/games/truth-or-dare');
    expect(event?.page_location).toBe('https://playtruthndare.com/games/truth-or-dare');
    expect(event?.page_title).toBe('Truth or Dare Online');
    expect(event?.page_locale).toBe('en');
  });

  it('tracks game_started with mode and game_id', () => {
    trackGameStarted({
      game_id: 'truth-or-dare',
      game_name: 'Truth or Dare',
      mode: 'pass_and_play',
    });

    const event = window.dataLayer?.find((e) => e.event === 'game_started');
    expect(event).toBeDefined();
    expect(event?.game_id).toBe('truth-or-dare');
    expect(event?.game_name).toBe('Truth or Dare');
    expect(event?.game_mode).toBe('pass_and_play');
  });

  it('tracks truth_selected without sending question prompt text (PII protection)', () => {
    trackTruthSelected({
      category: 'classic-party',
      language: 'en',
    });

    const event = window.dataLayer?.find((e) => e.event === 'truth_selected');
    expect(event).toBeDefined();
    expect(event?.card_type).toBe('truth');
    expect(event?.category).toBe('classic-party');
    expect(event?.language).toBe('en');
    expect(event?.prompt).toBeUndefined();
    expect(event?.text).toBeUndefined();
  });

  it('tracks dare_selected without sending prompt text', () => {
    trackDareSelected({
      category: 'couples-flirty',
      language: 'es',
    });

    const event = window.dataLayer?.find((e) => e.event === 'dare_selected');
    expect(event).toBeDefined();
    expect(event?.card_type).toBe('dare');
    expect(event?.category).toBe('couples-flirty');
    expect(event?.language).toBe('es');
    expect(event?.prompt).toBeUndefined();
  });

  it('tracks spinner_used without sending player names', () => {
    trackSpinnerUsed({
      slice_count: 8,
      duration_ms: 4500,
    });

    const event = window.dataLayer?.find((e) => e.event === 'spinner_used');
    expect(event).toBeDefined();
    expect(event?.slice_count).toBe(8);
    expect(event?.duration_ms).toBe(4500);
    expect(event?.players).toBeUndefined();
    expect(event?.winner_name).toBeUndefined();
  });

  it('tracks custom_deck_created without sending private deck titles or questions', () => {
    trackCustomDeckCreated({
      question_count: 15,
      language: 'hi',
    });

    const event = window.dataLayer?.find((e) => e.event === 'custom_deck_created');
    expect(event).toBeDefined();
    expect(event?.question_count).toBe(15);
    expect(event?.language).toBe('hi');
    expect(event?.deck_title).toBeUndefined();
    expect(event?.questions).toBeUndefined();
  });

  it('tracks custom_question_added without sending private question content', () => {
    trackCustomQuestionAdded({
      type: 'dare',
      language: 'en',
    });

    const event = window.dataLayer?.find((e) => e.event === 'custom_question_added');
    expect(event).toBeDefined();
    expect(event?.question_type).toBe('dare');
    expect(event?.language).toBe('en');
    expect(event?.prompt).toBeUndefined();
  });

  it('tracks room_created and room_joined without sending room codes or player names', () => {
    trackRoomCreated({ game_type: 'truth-or-dare' });
    trackRoomJoined({ game_type: 'multiplayer' });

    const createdEvent = window.dataLayer?.find((e) => e.event === 'room_created');
    const joinedEvent = window.dataLayer?.find((e) => e.event === 'room_joined');

    expect(createdEvent?.game_type).toBe('truth-or-dare');
    expect(createdEvent?.room_code).toBeUndefined();
    expect(createdEvent?.host_name).toBeUndefined();

    expect(joinedEvent?.game_type).toBe('multiplayer');
    expect(joinedEvent?.room_code).toBeUndefined();
    expect(joinedEvent?.player_name).toBeUndefined();
  });

  it('tracks game_completed, language_changed, and pwa_install_clicked', () => {
    trackGameCompleted({ game_id: 'truth-or-dare', rounds_played: 12 });
    trackLanguageChanged({ from_locale: 'en', to_locale: 'es' });
    trackPwaInstallClicked({ source: 'header' });

    expect(window.dataLayer?.find((e) => e.event === 'game_completed')?.rounds_played).toBe(12);
    expect(window.dataLayer?.find((e) => e.event === 'language_changed')?.to_locale).toBe('es');
    expect(window.dataLayer?.find((e) => e.event === 'pwa_install_clicked')?.install_source).toBe('header');
  });

  it('verifies GTM-MNXM9MQK is installed in app/layout.tsx in head and noscript iframe', () => {
    const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    // Official GTM container ID present
    expect(content).toContain('GTM-MNXM9MQK');

    // Script tag in head loading gtm.js
    expect(content).toContain('https://www.googletagmanager.com/gtm.js?id=');

    // Consent Mode default initialized with ad_storage denied
    expect(content).toContain("'ad_storage':'denied'");
    expect(content).toContain("'analytics_storage':'granted'");

    // Noscript iframe immediately after opening body
    expect(content).toContain('<noscript>');
    expect(content).toContain('https://www.googletagmanager.com/ns.html?id=GTM-MNXM9MQK');
    expect(content).toContain('</noscript>');

    // Route tracker present
    expect(content).toContain('<GTMRouteTracker />');
  });
});

