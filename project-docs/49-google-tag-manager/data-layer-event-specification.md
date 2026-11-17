# Play Truth & Dare — DataLayer Event Specification

**Container ID:** `GTM-MNXM9MQK`  
**Schema Version:** 1.0.0  
**Implementation Source:** [`lib/analytics/gtm.ts`](file:///Users/vaibhavborkar/truth&dare/lib/analytics/gtm.ts)  

---

## 1. Overview & Privacy Principles

Every custom event pushed to `window.dataLayer` follows Google's recommended event naming conventions while strictly enforcing privacy:
- **No Personally Identifiable Information (PII):** User emails, player names, IP addresses, and session tokens are strictly excluded.
- **No Private Question Content:** Custom question prompts and deck titles created by users remain 100% private and are never sent to analytics.
- **Success-Gated:** Events only fire after the underlying client or network action has succeeded (e.g., room created successfully via backend API, question validated and added to state, valid deck saved).

---

## 2. Event Reference Matrix

### 2.1 Navigation & System Events

#### `page_view`
Fires on client-side SPA navigation between views, games, hubs, and localized paths.
```json
{
  "event": "page_view",
  "page_path": "/games/truth-or-dare",
  "page_location": "https://playtruthndare.com/games/truth-or-dare",
  "page_title": "Truth or Dare Online — Play Truth & Dare",
  "page_locale": "en"
}
```

#### `language_changed`
Fires when the player selects a new platform language from the global language selector.
```json
{
  "event": "language_changed",
  "from_locale": "en",
  "to_locale": "es"
}
```

#### `pwa_install_clicked`
Fires when the player clicks the progressive web app install CTA.
```json
{
  "event": "pwa_install_clicked",
  "install_source": "header"
}
```
*Allowed `install_source` values: `"header"`, `"drawer"`, `"footer"`, `"pill"`.*

---

### 2.2 Gameplay & Card Events

#### `game_started`
Fires when the player initiates a new gameplay session from the setup lobby.
```json
{
  "event": "game_started",
  "game_id": "truth-or-dare",
  "game_name": "Truth or Dare",
  "game_mode": "pass_and_play"
}
```
*Allowed `game_mode` values: `"solo"`, `"pass_and_play"`, `"multiplayer"`.*

#### `truth_selected`
Fires when a player draws a Truth card.
```json
{
  "event": "truth_selected",
  "card_type": "truth",
  "category": "classic-party",
  "language": "en"
}
```
*Note: The question prompt is NEVER transmitted.*

#### `dare_selected`
Fires when a player draws a Dare card.
```json
{
  "event": "dare_selected",
  "card_type": "dare",
  "category": "couples-flirty",
  "language": "es"
}
```
*Note: The question prompt is NEVER transmitted.*

#### `game_completed`
Fires when the question deck is exhausted or players complete a match summary.
```json
{
  "event": "game_completed",
  "game_id": "truth-or-dare",
  "rounds_played": 15
}
```

---

### 2.3 Spinner Wheel Events

#### `spinner_used`
Fires when the player initiates a spin on the physics wheel.
```json
{
  "event": "spinner_used",
  "slice_count": 8,
  "duration_ms": 4500
}
```
*Note: Custom slice labels and player names are NEVER transmitted.*

---

### 2.4 Custom Deck Studio Events

#### `custom_question_added`
Fires when a player adds a valid Truth or Dare to their custom deck.
```json
{
  "event": "custom_question_added",
  "question_type": "truth",
  "language": "hi"
}
```
*Note: The custom question text is NEVER transmitted.*

#### `custom_deck_created`
Fires when a custom deck is saved to local storage and the server repository.
```json
{
  "event": "custom_deck_created",
  "question_count": 20,
  "language": "en"
}
```
*Note: The deck title and question contents are NEVER transmitted.*

---

### 2.5 Multiplayer Room Events

#### `room_created`
Fires when a player creates a real-time multiplayer room.
```json
{
  "event": "room_created",
  "game_type": "truth-or-dare"
}
```
*Note: Room codes and host names are NEVER transmitted.*

#### `room_joined`
Fires when a player successfully enters a multiplayer room.
```json
{
  "event": "room_joined",
  "game_type": "multiplayer"
}
```
*Note: Room codes and player nicknames are NEVER transmitted.*

