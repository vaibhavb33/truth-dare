# Functional Requirements Specification (FRS)

**Project Name:** Project Asteria  
**Document:** Functional Requirements Specification (15 Modules)  
**Role:** Senior Product Manager & Business Analyst  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## Module Index
1. [Homepage & Instant Launch](#1-homepage--instant-launch)
2. [Game Directory & Hub](#2-game-directory--hub)
3. [Truth or Dare Core Engine](#3-truth-or-dare-core-engine)
4. [Interactive Spinner Wheel](#4-interactive-spinner-wheel)
5. [Never Have I Ever Engine](#5-never-have-i-ever-engine)
6. [Would You Rather Engine](#6-would-you-rather-engine)
7. [Most Likely To Engine](#7-most-likely-to-engine)
8. [This or That Dilemma Engine](#8-this-or-that-dilemma-engine)
9. [Custom Question Generator / Deck Creator](#9-custom-question-generator--deck-creator)
10. [Multiplayer Game Rooms](#10-multiplayer-game-rooms)
11. [Custom Game Packs](#11-custom-game-packs)
12. [User Preferences & Audio System](#12-user-preferences--audio-system)
13. [Question Library & Anti-Duplication Engine](#13-question-library--anti-duplication-engine)
14. [Editorial Guides & Rules Hub](#14-editorial-guides--rules-hub)
15. [Content Administration Portal](#15-content-administration-portal)

---

### 1. Homepage & Instant Launch
* **Feature Objective:** Deliver an immediate, frictionless entry point allowing users to launch a game session or create a room in under 2 seconds.
* **Target Users:** All personas (Party hosts, couples, friends, casual visitors).
* **User Journey:**
  1. User navigates to root domain `/`.
  2. Hero section displays vibrant tagline, active game counters, and two primary action buttons: **"Quick Play"** (launches default game) and **"Create Room"** (opens multiplayer setup).
  3. Below hero: Category carousel showcasing featured party decks with immediate "Play Now" triggers.
* **Functional Requirements:**
  * FR-1.1: Load within 2.0s on 4G networks; hero rendered above-the-fold without cumulative layout shift.
  * FR-1.2: Single-tap "Quick Play" automatically routes to `/games/truth-or-dare` with "Classic Party" deck preloaded.
  * FR-1.3: "Create Room" triggers room creation modal, generating a unique 6-character room code.
  * FR-1.4: "Enter Code" input field allows guests to join an existing room directly from the homepage.
* **Business Rules:**
  * BR-1.1: Zero account registration or email requirement to start playing.
  * BR-1.2: Adult/Spicy 18+ decks cannot be featured in primary top-of-page carousel without age-gate consent.
* **Edge Cases:** User enters an invalid or expired 6-character room code. System displays inline feedback: *"Room code not found or expired. Please check with your host."*
* **Error States:** Network offline: Displays offline banner notifying that single-player local mode is still available offline via PWA cache.
* **Mobile Behaviour:** Sticky bottom navigation bar with "Play", "Rooms", "Games", and "Settings" icons.
* **Accessibility:** All hero buttons have clear `aria-label` tags; keyboard tab order starts with primary CTA.
* **Acceptance Criteria:** AC-1.1: Clicking "Quick Play" transitions to active game screen in < 300ms.
* **Dependencies:** Routing engine, local storage configuration.

---

### 2. Game Directory & Hub
* **Feature Objective:** Showcase the complete suite of party games with visual previews, player count recommendations, and tag filters.
* **Target Users:** Group hosts looking for specific game types (icebreakers, drinking games, couples).
* **User Journey:** User navigates to `/games` -> filters by player count (2 players, 3–6, 7+) or vibe (Hilarious, Deep, Spicy) -> clicks game card to launch.
* **Functional Requirements:**
  * FR-2.1: Grid display of all games (Truth or Dare, Spin Wheel, Never Have I Ever, Would You Rather, Most Likely To, This or That).
  * FR-2.2: Instant client-side filtering by audience, intensity (1–5), and player count without full-page reloads.
  * FR-2.3: Each game card displays: Game Title, Recommended Players, Estimated Duration, and Intensity Badge.
* **Business Rules:** BR-2.1: Content labeled "Spicy 18+" requires affirmative age confirmation before the card expands.
* **Edge Cases:** Zero search results matching filter combination: Displays: *"No games match your selected filters. Reset filters to see all party games."* with a 1-tap "Reset Filters" button.
* **Error States:** Graceful fallback if card thumbnail fails to load (renders solid CSS gradient background with icon).
* **Mobile Behaviour:** Horizontal scrolling swipe chips for quick category filtering.
* **Accessibility:** Filter toggles use `role="checkbox"` or `role="radio"` with `aria-checked` states.
* **Acceptance Criteria:** AC-2.1: Filtering updates the displayed game grid in < 50ms.
* **Dependencies:** Category taxonomy, design system tokens.

---

### 3. Truth or Dare Core Engine
* **Feature Objective:** Provide the premier digital Truth or Dare game loop with fluid 3D card physics, countdown timer, and turn rotation.
* **Target Users:** All personas (Couples, Friends, Teens, Adult groups).
* **User Journey:**
  1. Active player sees: *"Sarah's Turn"*.
  2. Player taps either **"TRUTH"** (blue theme) or **"DARE"** (orange theme).
  3. Card performs a 3D perspective flip, playing a procedural audio whoosh, and reveals the prompt.
  4. If "Dare" is chosen, optional countdown timer starts with audio ticking.
  5. Player taps **"Complete"** (celebratory chime + confetti) or **"Skip"** (penalty prompt or next turn).
* **Functional Requirements:**
  * FR-3.1: Cryptographic randomization with anti-repetition memory (no card repeats until deck exhaustion).
  * FR-3.2: 3D card flip hardware-accelerated with CSS `transform: rotateY(180deg)`.
  * FR-3.3: Integrated dare timer (presets: 15s, 30s, 60s, or disabled) with visual progress ring and audio tick.
  * FR-3.4: Local Pass & Play turn roster supporting 2 to 20 players.
* **Business Rules:**
  * BR-3.1: Skipping is always allowed without shame or unskippable blockers.
  * BR-3.2: 18+ mode prompts must pass safety guidelines (no non-consensual or dangerous physical actions).
* **Edge Cases:** Deck exhausted (all 200+ cards drawn): Display "Deck Complete!" modal with options: "Reshuffle Deck" or "Switch Category".
* **Error States:** Custom deck loaded with empty prompt list: Alert: *"This deck has no cards. Add prompts to play."*
* **Mobile Behaviour:** Full-height viewport layout (`100dvh`); primary action buttons placed in bottom thumb zone.
* **Accessibility:** Prompt reveal announces via `aria-live="polite"` for screen readers; full keyboard trigger via `T` (Truth) and `D` (Dare).
* **Acceptance Criteria:** AC-3.1: Zero duplicate cards appear in 50 consecutive draws from a 100-card deck.
* **Dependencies:** Audio synthesizer, haptics API, state store (Zustand).

---

### 4. Interactive Spinner Wheel
* **Feature Objective:** Digital spinning bottle / wheel for randomized player picking or forfeit determination.
* **Target Users:** House party groups, drinking game circles.
* **User Journey:** Host taps "Spin" -> Wheel/bottle spins with realistic physics deceleration and clicking audio -> Points at designated player or dare consequence.
* **Functional Requirements:**
  * FR-4.1: Canvas-based physics wheel with randomized velocity, friction deceleration, and haptic rumble on slice tick.
  * FR-4.2: Configurable slices (Player names from active roster OR consequence stakes e.g., "Take 2 Sips", "Do 10 Pushups").
  * FR-4.3: Direct integration with Truth or Dare: The winning slice can automatically trigger a card draw for that player.
* **Business Rules:** BR-4.1: Equal probability distribution across all configured wheel slices.
* **Edge Cases:** Less than 2 slices configured: Spin button disabled with tooltip: *"Add at least 2 players or options to spin."*
* **Mobile Behaviour:** Swipe-to-spin gesture support in addition to tap button.
* **Accessibility:** Wheel outcome announced via ARIA live region upon stop.
* **Acceptance Criteria:** AC-4.1: Wheel rotates smoothly at 60fps across modern mobile browsers.
* **Dependencies:** Canvas API, Web Audio synthesizer.

---

### 5. Never Have I Ever Engine
* **Feature Objective:** Digital life-tracking game loop for "Never Have I Ever" with group confession reveals.
* **Target Users:** Pre-game drinking circles, college parties, friend groups.
* **User Journey:** Prompt reveals: *"Never have I ever ghosted someone after three dates"*. Players tap **"I Have"** (losing a life / taking a sip) or **"I Never"**.
* **Functional Requirements:**
  * FR-5.1: "10 Fingers Down" / Life Counter mode (players start with 5 or 10 points; losing a life triggers drop animation).
  * FR-5.2: In multiplayer rooms, aggregate room stats are revealed: *"4 of 6 players have done this!"*.
* **Business Rules:** BR-5.1: Filterable by Clean, Party, and Wild 18+.
* **Edge Cases:** Player lives reach 0: Player enters "Spectator / Game Over" state with options to reset or watch remaining players.
* **Mobile Behaviour:** Double-tap gesture on mobile screen counts as "I Have".
* **Acceptance Criteria:** AC-5.1: Lives decrement accurately across all players in room sync.
* **Dependencies:** Multiplayer room sync, state store.

---

### 6. Would You Rather Engine
* **Feature Objective:** Dilemma game presenting two difficult/hilarious choices with live community answer percentages.
* **Target Users:** Couples, road trips, casual friend groups.
* **User Journey:** Card displays Option A vs. Option B -> Player taps their choice -> Card flips to reveal live global aggregate stats: *"64% Option A | 36% Option B"*.
* **Functional Requirements:**
  * FR-6.1: Dual-card split-screen layout with distinct color contrast.
  * FR-6.2: Selection animation reveals community percentage bar with smooth numeric count-up.
  * FR-6.3: "Next Dilemma" button loads subsequent prompt with anti-repetition memory.
* **Business Rules:** BR-6.1: User vote is submitted anonymously to global aggregate counter.
* **Edge Cases:** Offline play: If disconnected from network, percentages load from cached static baseline data.
* **Mobile Behaviour:** Vertical stack layout on mobile portrait (Option A top, Option B bottom).
* **Acceptance Criteria:** AC-6.1: Selecting an option locks choice and reveals percentages in < 100ms.
* **Dependencies:** Stats API endpoint, local caching.

---

### 7. Most Likely To Engine
* **Feature Objective:** Real-time social voting game where participants nominate the room player who fits the prompt.
* **Target Users:** Friend groups, social media circles, sleepovers.
* **User Journey:** Prompt reveals: *"Who is most likely to win the lottery and lose the ticket?"* -> Room participants tap the name of a player in the room -> Countdown ends -> Most voted player is crowned with winner animation.
* **Functional Requirements:**
  * FR-7.1: Synchronized 15-second voting countdown.
  * FR-7.2: Secret ballot submission until timer expiration.
  * FR-7.3: Crown reveal screen showing vote tally breakdown for each player.
* **Business Rules:** BR-7.1: Players may vote for themselves or another player in the active room roster.
* **Edge Cases:** Tie vote: Both players are crowned with "Tied Winners" banner.
* **Mobile Behaviour:** Avatar grid with 1-tap vote submission.
* **Acceptance Criteria:** AC-7.1: Votes tallies synchronize across all room clients within 200ms of timer expiration.
* **Dependencies:** Multiplayer room engine, WebSockets/Realtime.

---

### 8. This or That Dilemma Engine
* **Feature Objective:** 60-second rapid-fire preference gauntlet with mobile swipe ergonomics.
* **Target Users:** Dating couples, icebreaker sessions, speed hangouts.
* **User Journey:** Two options appear (e.g., "Coffee or Tea", "Beach or Mountains") -> Player swipes left/right or taps -> Next pair slides in instantly -> Summary report at end.
* **Functional Requirements:**
  * FR-8.1: Touch swipe left/right gestures (Tinder-style ergonomics) with spring physics.
  * FR-8.2: 60-second countdown mode or 20-card fixed round mode.
  * FR-8.3: End-of-round summary screen with compatibility comparison for 2 players.
* **Business Rules:** BR-8.1: High-velocity transitions (< 50ms between cards) to preserve flow state.
* **Mobile Behaviour:** Full touch swipe gesture recognition with threshold snap-back.
* **Acceptance Criteria:** AC-8.1: Swiping card beyond 40% screen width registers choice and dismisses card smoothly.
* **Dependencies:** Touch gesture handlers, CSS animations.

---

### 9. Custom Question Generator / Deck Creator
* **Feature Objective:** Empower players to create, save, edit, and play their own personalized Truth or Dare decks without requiring an account.
* **Target Users:** Birthday party hosts, bachelorette planners, inside-joke friend circles.
* **User Journey:** User navigates to `/custom` -> Taps "Create New Deck" -> Enters Deck Title -> Types custom Truths and Dares with 1-tap "+ Add" -> Saves deck to browser -> Taps "Play with this Deck".
* **Functional Requirements:**
  * FR-9.1: Form inputs for Deck Title, Category Tag, and Prompt Type (Truth vs. Dare).
  * FR-9.2: Instant client-side validation (minimum 5 cards required to start a game; max 300 characters per prompt).
  * FR-9.3: Saved decks stored in `localStorage` under namespaced key `asteria_custom_decks`.
  * FR-9.4: Export/Import feature: Generates portable JSON snippet or shareable URL hash.
* **Business Rules:** BR-9.1: Automated client-side sanitization against XSS and script injection.
* **Edge Cases:** User clears browser cache: Provide "Export Deck as Text/JSON" so users can backup custom decks.
* **Error States:** Empty prompt field submission: Highlights field with inline error: *"Prompt text cannot be empty."*
* **Mobile Behaviour:** Sticky "+ Add Prompt" button above the mobile software keyboard.
* **Acceptance Criteria:** AC-9.1: Custom deck persists across browser restarts and successfully loads in game engine.
* **Dependencies:** `localStorage` manager, validator utilities.

---

### 10. Multiplayer Game Rooms
* **Feature Objective:** Real-time synchronized gaming across multiple mobile phones or computers using 6-character room codes or QR codes.
* **Target Users:** Long-distance friends, Discord hangouts, remote couples, party groups where everyone holds their own phone.
* **User Journey:**
  1. Host taps **"Create Room"** -> Selects deck and rules -> System displays 6-character Room Code (e.g., `PARTY9`) and large QR code.
  2. Guests scan QR code with phone camera or enter `PARTY9` at `/join`.
  3. Host sees player presence roster update in real time (*"Alex joined", "Maya joined"*).
  4. Host taps **"Start Game"** -> All connected screens transition to the game board in sync.
  5. Active player reveals card -> Card flips simultaneously on all connected devices in < 150ms.
  6. Connected players tap floating emoji reaction buttons that burst across all screens.
* **Functional Requirements:**
  * FR-10.1: Room state synchronization: Active card, player turn, timer state, and score replicated via low-latency WebSockets / Realtime channel.
  * FR-10.2: Host controls: Kick player, transfer host, skip card, pause timer, change game deck.
  * FR-10.3: Live emoji reaction stream: Tap 🔥, 😂, 😱, 👏 to broadcast floating particle animation.
  * FR-10.4: Dare consensus voting: Room displays "Did they do it?" with "Passed" / "Chickened Out" buttons.
  * FR-10.5: Reconnection handling: If a player temporarily disconnects, client automatically attempts reconnection with exponential backoff (1s, 2s, 4s).
* **Business Rules:**
  * BR-10.1: Maximum room capacity: 20 active players (spectators unlimited).
  * BR-10.2: Room codes expire after 2 hours of inactivity.
* **Edge Cases:** Host leaves or closes browser: Room automatically promotes the next longest-connected player to Host.
* **Error States:** Connection lost: Floating banner appears: *"Connection interrupted. Reconnecting..."* with a manual "Refresh Sync" button.
* **Mobile Behaviour:** Optimized for portrait view; floating reactions positioned along right edge for thumb tapping.
* **Accessibility:** All room status announcements dispatched to screen reader live regions.
* **Acceptance Criteria:** AC-10.1: Card flip state is replicated to all connected clients within 150ms under normal network conditions.
* **Dependencies:** Realtime networking engine, room state store.

---

### 11. Custom Game Packs
* **Feature Objective:** Curated thematic packs ready for one-tap play, plus community-curated packs.
* **Target Users:** Specific gathering archetypes (Road trip, Sleepover, Tech Happy Hour, Stag Night).
* **Functional Requirements:**
  * FR-11.1: Pack preview modal showing sample cards, card count, intensity rating, and author.
  * FR-11.2: One-tap "Add to Room" button injecting the pack into the current game session.
  * FR-11.3: Community pack submission form with content moderation screening.
* **Business Rules:** BR-11.1: Unmoderated community packs cannot appear in public catalog without passing automated safety filter.
* **Acceptance Criteria:** AC-11.1: Selecting a pack merges prompts into active session deck without clearing existing game state.
* **Dependencies:** Question library database.

---

### 12. User Preferences & Audio System
* **Feature Objective:** Universal control over sound effects, haptic feedback, dark/light themes, and safe mode.
* **Target Users:** All users across all devices and settings (quiet library, loud party, sensory-sensitive users).
* **Functional Requirements:**
  * FR-12.1: Master Audio Mute toggle permanently accessible in header.
  * FR-12.2: Procedural sound volume slider (0% to 100%).
  * FR-12.3: Mobile Haptics toggle (Enable / Disable `navigator.vibrate`).
  * FR-12.4: Theme toggle: Dark Mode (default high-contrast party theme) vs. Light Mode.
  * FR-12.5: Family Safe Mode toggle: Locks all 18+ content behind 4-digit PIN.
* **Business Rules:** BR-12.1: Preferences persist in `localStorage` across all sessions and game modules.
* **Mobile Behaviour:** Sound toggle accessible in top navigation bar with clear speaker icon states (muted / unmuted).
* **Acceptance Criteria:** AC-12.1: Toggling mute immediately silences all Web Audio synthesis instances.
* **Dependencies:** Web Audio API, Web Haptics API, CSS theme variables.

---

### 13. Question Library & Anti-Duplication Engine
* **Feature Objective:** Central repository of 1,000+ curated, original prompts with algorithmic deduplication and tag indexing.
* **Target Users:** Internal game engines and content editors.
* **Functional Requirements:**
  * FR-13.1: Prompts indexed by: `id`, `type` (truth/dare), `category` (party/couples/teens/kids/spicy), `intensity` (1–5), `safety_rating` (G/PG/PG13/R), `tags`.
  * FR-13.2: Fisher-Yates shuffle engine generates randomized card sequences on session start.
  * FR-13.3: In-memory session tracking set: `drawn_card_ids: Set<string>`.
  * FR-13.4: Filter query engine: Combines multiple tags (e.g., `category = couples AND intensity <= 3`).
* **Business Rules:**
  * BR-13.1: Zero prompt duplication permitted within an active session until all matching cards have been drawn.
  * BR-13.2: Every prompt must be 100% original, verified against external copyright or competitor databases.
* **Acceptance Criteria:** AC-13.1: Drawing 100 cards from a 100-card deck exhausts the deck with exactly 0 duplicates.
* **Dependencies:** Data schemas, TypeScript models.

---

### 14. Editorial Guides & Rules Hub
* **Feature Objective:** Authoritative party game rules, variations, icebreaker guides, and SEO listicles.
* **Target Users:** Party hosts seeking rules disputes resolution, organic search visitors.
* **Functional Requirements:**
  * FR-14.1: Clean typographic reading experience with table of contents and quick anchor links.
  * FR-14.2: Embedded "Play Now" interactive card widget within editorial articles.
  * FR-14.3: Full Schema.org `Article`, `HowTo`, and `FAQPage` JSON-LD markup.
* **Business Rules:** BR-14.1: Static site generation (SSG) for ultra-fast crawlability and indexation.
* **Acceptance Criteria:** AC-14.1: 100% valid Schema.org validation on Google Rich Results Test.
* **Dependencies:** Next.js static rendering, SEO blueprint.

---

### 15. Content Administration Portal
* **Feature Objective:** Secure interface for content managers to review, edit, approve, and tag questions and custom packs.
* **Target Users:** Product managers, content editors, safety moderators.
* **Functional Requirements:**
  * FR-15.1: Question management table with sorting, search, and bulk tag editing.
  * FR-15.2: Community submission moderation queue with "Approve", "Edit", or "Reject" actions.
  * FR-15.3: Automated keyword flagger alerting moderators to potentially unsafe words.
* **Business Rules:** BR-15.1: Protected by role-based access control (RBAC).
* **Acceptance Criteria:** AC-15.1: Approving a prompt in the admin portal flags it for inclusion in the next production build.
* **Dependencies:** Auth system, database models.

