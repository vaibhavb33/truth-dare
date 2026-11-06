# Agile User Stories & Acceptance Scenarios

**Project Name:** Project Asteria  
**Document:** User Stories & Acceptance Scenarios  
**Role:** Senior Product Manager & Business Analyst  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## Story Mapping by Epic

```
Epic 1: Instant Discovery & Navigation (Homepage & Hub)
Epic 2: Core Truth or Dare Gameplay Loop (Cards, Flips, Audio)
Epic 3: Local Pass & Play Experience (Roster, Turns, Scoring)
Epic 4: Real-Time Multiplayer Rooms (Codes, QR, State Sync, Emojis)
Epic 5: Extended Party Game Suite (Never Have I Ever, Would You Rather, Spin Wheel)
Epic 6: Deck Customization & Preferences (Custom Decks, Audio/Haptics)
Epic 7: Safety, Consent & Age Gating (Age Gate, Safe Skip, PIN Mode)
Epic 8: Editorial Content & Programmatic SEO (Landing Pages, Structured Data)
```

---

## Epic 1: Instant Discovery & Navigation

### US-101: Instant Zero-Friction Launch
* **As a** casual party host arriving at the website,
* **I want to** start playing a game with a single tap without creating an account or logging in,
* **So that** I don't lose the party's attention with tedious sign-up forms.
* **Acceptance Scenario:**
  * **Given** I am on the homepage on my smartphone,
  * **When** I tap the "Quick Play" button,
  * **Then** the game board loads immediately in under 300ms with a ready-to-play card, without asking for an email, password, or app download.

### US-102: Game Directory Filtering
* **As a** dinner party host,
* **I want to** filter games by group size, vibe, and intensity,
* **So that** I can find an appropriate icebreaker game for my guests quickly.
* **Acceptance Scenario:**
  * **Given** I am on the `/games` directory,
  * **When** I tap the "Icebreaker" filter and select "3–6 Players",
  * **Then** the catalog instantly filters down to matching games without a full page reload.

---

## Epic 2: Core Truth or Dare Gameplay Loop

### US-201: Choosing Truth vs. Dare
* **As an** active player during my turn,
* **I want to** choose whether I answer a "Truth" or perform a "Dare",
* **So that** I have agency over the type of challenge I face.
* **Acceptance Scenario:**
  * **Given** it is my turn on the game screen,
  * **When** I tap the "Truth" button,
  * **Then** the card executes a 3D perspective flip with an audio whoosh and reveals a randomized Truth question.

### US-202: Dare Countdown Timer
* **As a** party participant performing a physical challenge,
* **I want to** see and hear a visual countdown timer for my dare,
* **So that** the entire group shares the suspense and knows exactly how much time I have left.
* **Acceptance Scenario:**
  * **Given** a Dare card is revealed with a 30-second timer enabled,
  * **When** the timer begins counting down,
  * **Then** a circular progress ring animates down, synthesized ticks play every second, and a celebration chime sounds when time expires.

### US-203: Smart Anti-Repetition Shuffle
* **As a** party group playing an extended 45-minute session,
* **I want to** see new, fresh questions on every draw,
* **So that** we never experience the boredom of duplicate questions repeating.
* **Acceptance Scenario:**
  * **Given** an active game session using the 150-card "Classic Party" deck,
  * **When** we draw 80 consecutive cards,
  * **Then** zero duplicate questions appear, verified by the session history tracker.

---

## Epic 3: Local Pass & Play Experience

### US-301: Player Roster & Turn Rotation
* **As a** party host passing a single phone around the circle,
* **I want** the app to track everyone's name and clearly announce whose turn it is,
* **So that** we don't argue over who goes next.
* **Acceptance Scenario:**
  * **Given** I have added "Marcus, Priya, Jordan, and Sarah" to the player roster,
  * **When** Marcus completes his turn and taps "Next Player",
  * **Then** the screen displays in large text: *"Priya's Turn! Truth or Dare?"* and advances the roster index.

### US-302: Score & Skip Tracking
* **As a** competitive player,
* **I want** the game to track completed dares and skips for each player,
* **So that** we can see a fun leaderboard of who was bravest at the end of the night.
* **Acceptance Scenario:**
  * **Given** a player completes a dare and taps "Completed (+1 Pt)",
  * **When** we view the session scoreboard,
  * **Then** that player's score increments by 1 point, while skipped turns increment their skip counter.

---

## Epic 4: Real-Time Multiplayer Rooms

### US-401: Creating a Room & Joining via QR / 6-Digit Code
* **As a** host hanging out with friends who all have their own smartphones,
* **I want to** create an online room and show a QR code or 6-digit code,
* **So that** everyone can join instantly from their own screens in seconds.
* **Acceptance Scenario:**
  * **Given** I tap "Create Room",
  * **When** the room is generated,
  * **Then** I am shown a clean 6-digit code (e.g., `GAME42`) and a scannable QR code that opens the room directly in guests' mobile browsers without installation.

### US-402: Synchronized Simultaneous Card Reveals
* **As a** participant in a remote Discord party call,
* **I want** the card to flip on my screen at the exact same moment the host flips it,
* **So that** we all react together without delay.
* **Acceptance Scenario:**
  * **Given** 4 players are connected to room `GAME42`,
  * **When** the active player selects "Dare",
  * **Then** all 4 screens execute the 3D card flip simultaneously within 150ms.

### US-403: Live Floating Emoji Reactions
* **As a** room participant listening to a friend's embarrassing confession,
* **I want to** tap floating reaction buttons (🔥, 😂, 😱, 👏),
* **So that** animated emojis burst across everyone's screens to amplify the laughter.
* **Acceptance Scenario:**
  * **Given** a player is answering a spicy Truth,
  * **When** I tap the 🔥 reaction button on my phone,
  * **Then** animated flame emojis float up the screen on all connected player devices in real time.

### US-404: Room Dare Consensus Voting
* **As a** player watching someone attempt a ridiculous dare,
* **I want** the room to vote whether the player successfully completed it or chickened out,
* **So that** the group decides if points or drink penalties should be awarded.
* **Acceptance Scenario:**
  * **Given** a player finishes their dare attempt,
  * **When** the voting prompt appears on all players' screens,
  * **Then** players vote "Passed" or "Failed", and the majority result is displayed with an animated banner.

---

## Epic 5: Extended Party Game Suite

### US-501: Spin the Bottle / Wheel
* **As a** party host,
* **I want to** spin a virtual bottle or customized wheel,
* **So that** a physical, suspenseful animation chooses who goes next or assigns a dare forfeit.
* **Acceptance Scenario:**
  * **Given** I am on the Spinner Wheel game,
  * **When** I tap or swipe to spin the wheel,
  * **Then** the wheel rotates with natural physics deceleration, produces haptic clicking sounds, and lands cleanly on a slice.

### US-502: Never Have I Ever Life Counter
* **As a** player in a drinking game circle,
* **I want** a "10 Fingers Down" digital life counter on "Never Have I Ever",
* **So that** we can track who has the wildest past confessions and who gets eliminated first.
* **Acceptance Scenario:**
  * **Given** a "Never Have I Ever" prompt appears,
  * **When** I tap "I Have",
  * **Then** one of my virtual lives drops with a sound effect, and the room tally updates.

### US-503: Would You Rather Community Percentages
* **As a** curious player answering a tough moral dilemma,
* **I want to** see the percentage of global users who picked each option,
* **So that** I can compare my choice with the rest of the world.
* **Acceptance Scenario:**
  * **Given** a "Would You Rather" dilemma card,
  * **When** I select Option A,
  * **Then** the card animates to show: *"62% of players chose Option A | 38% chose Option B"*.

---

## Epic 6: Deck Customization & Preferences

### US-601: Custom Deck Builder
* **As a** friend group with inside jokes,
* **I want to** write and save our own custom Truths and Dares into our browser,
* **So that** we can play an ultra-personalized game made exclusively for our group.
* **Acceptance Scenario:**
  * **Given** I am on the Custom Deck Creator,
  * **When** I input a deck name, add 10 custom prompts, and tap "Save Deck",
  * **Then** the deck is saved to `localStorage` and immediately selectable in the game deck picker.

### US-602: Universal Audio Mute
* **As a** user playing late at night or in a quiet setting,
* **I want to** mute all sound effects with a single tap in the header,
* **So that** I don't disturb people around me.
* **Acceptance Scenario:**
  * **Given** sound effects are enabled,
  * **When** I tap the Speaker icon in the header,
  * **Then** all Web Audio synthesis immediately ceases and the icon updates to a muted state.

---

## Epic 7: Safety, Consent & Age Gating

### US-701: Explicit Age Verification Gate
* **As a** platform maintaining responsible content standards,
* **I want to** require an affirmative 18+ age verification check before unlocking adult decks,
* **So that** minors are protected from mature themes.
* **Acceptance Scenario:**
  * **Given** a user attempts to select the "Spicy / After Dark 18+" deck,
  * **When** they click the deck tile for the first time,
  * **Then** a full-screen modal requires them to confirm they are 18+ before granting access, persisting consent in `localStorage`.

### US-702: Unconditional Veto / Skip Power
* **As a** player who feels uncomfortable with a generated dare,
* **I want to** tap "Skip / Veto" without being forced or penalized,
* **So that** my personal boundaries and comfort are respected at all times.
* **Acceptance Scenario:**
  * **Given** a dare prompt is active on screen,
  * **When** I tap the "Veto / Skip" button,
  * **Then** the card is immediately dismissed, replaced by the next player's turn, with no mandatory forfeit or blocking modals.

---

## Epic 8: Content Administration & SEO

### US-801: Programmatic SEO Landing Pages
* **As an** organic search visitor searching for "truth or dare for couples",
* **I want to** land on a dedicated, high-speed page with curated prompts and an instant play button,
* **So that** I get immediate value without searching through unrelated categories.
* **Acceptance Scenario:**
  * **Given** I search Google and click `/games/truth-or-dare/couples`,
  * **When** the page renders,
  * **Then** I see an interactive couples game preview at the top, followed by curated lists with valid Schema.org `Quiz` and `FAQPage` JSON-LD data.

