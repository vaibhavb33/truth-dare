# Screen Design Specifications: The 20 Core Screens

**Project Name:** Project Asteria  
**Document:** Master Page Design Specifications (All 20 Screens)  
**Role:** Senior UI/UX Designer & Product Design Lead  
**Date:** November 5, 2026  
**Status:** Complete — Ready for Review

---

## Screen Directory
1. [Screen 01: Homepage](#screen-01-homepage)
2. [Screen 02: Games Directory](#screen-02-games-directory)
3. [Screen 03: Truth or Dare Setup](#screen-03-truth-or-dare-setup)
4. [Screen 04: Truth or Dare Gameplay (Distraction-Free)](#screen-04-truth-or-dare-gameplay-distraction-free)
5. [Screen 05: Spinner Wheel](#screen-05-spinner-wheel)
6. [Screen 06: Never Have I Ever](#screen-06-never-have-i-ever)
7. [Screen 07: Would You Rather](#screen-07-would-you-rather)
8. [Screen 08: Most Likely To](#screen-08-most-likely-to)
9. [Screen 09: This or That](#screen-09-this-or-that)
10. [Screen 10: Multiplayer Room](#screen-10-multiplayer-room)
11. [Screen 11: Custom Question Creator](#screen-11-custom-question-creator)
12. [Screen 12: Game Result & Leaderboard](#screen-12-game-result--leaderboard)
13. [Screen 13: Question Library](#screen-13-question-library)
14. [Screen 14: Blog Listing](#screen-14-blog-listing)
15. [Screen 15: Blog Article](#screen-15-blog-article)
16. [Screen 16: About Page](#screen-16-about-page)
17. [Screen 17: Contact Page](#screen-17-contact-page)
18. [Screen 18: Privacy Policy](#screen-18-privacy-policy)
19. [Screen 19: Terms of Service](#screen-19-terms-of-service)
20. [Screen 20: Admin Dashboard](#screen-20-admin-dashboard)

---

### Screen 01: Homepage
* **Route:** `/`
* **Purpose:** High-conversion entry point allowing immediate gameplay launch or multiplayer room creation while establishing brand prestige and SEO depth.
* **Layout Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│ [LOGO: ASTERIA]          [Room Code Input] [🔊] [⚙️]   │
├────────────────────────────────────────────────────────┤
│ HERO SECTION                                           │
│  ✨ NEXT-GEN PARTY GAMING                              │
│  "Unleash Unfiltered Party Night."                     │
│  [ ▶ QUICK PLAY (Classic Party) ]   [ 👥 CREATE ROOM ]  │
│  Badge: ⚡ 100% Free • Zero Downloads • Zero Pop-ups    │
├────────────────────────────────────────────────────────┤
│ POPULAR CATEGORIES CAROUSEL (Horizontal Scroll)        │
│  [Classic]  [Couples]  [Teens]  [Wild 18+]  [Deep]     │
├────────────────────────────────────────────────────────┤
│ FEATURED PARTY SUITE (Grid)                            │
│  [Truth/Dare] [Spin Wheel] [Never Have I] [Would You]  │
├────────────────────────────────────────────────────────┤
│ HOW TO PLAY (3-Step Micro Steps)                       │
│  1. Pick a Deck  ->  2. Pass or Share Code  -> 3. Play!│
├────────────────────────────────────────────────────────┤
│ WHY CHOOSE ASTERIA (Value Pillars Grid)                │
│  • No App Needed • Zero Ads • Realtime Sync • Web Audio│
├────────────────────────────────────────────────────────┤
│ MULTIPLAYER PROMOTION (Interactive Room Code Showcase) │
│  "Play over FaceTime or Discord in 1 Click" [QR Demo]  │
├────────────────────────────────────────────────────────┤
│ TRENDING QUESTIONS OF THE WEEK (Accordion / Card Flip) │
│ RECENTLY ADDED COMMUNITY DECKS                         │
│ FREQUENTLY ASKED QUESTIONS (Accordion with Schema.org) │
│ SEO EDITORIAL CONTENT (Rich Indexable Text Section)    │
│ FOOTER (Directory, Rules, Legal, Social Links)         │
└────────────────────────────────────────────────────────┘
```
* **Visual Treatment:** Inky deep navy base (`#0A0A16`) with electric violet ambient hero glow. Primary CTA is `gradient-action-primary` with hover brightness.
* **Mobile Adaptations:** Room code input collapses into an icon button that expands an input drawer; category carousel supports momentum touch scroll.

---

### Screen 02: Games Directory
* **Route:** `/games`
* **Purpose:** Visual catalog showcasing all 6 game types with tag filters, duration tags, and intensity indicators.
* **Layout Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│ [HEADER]                                               │
│ Title: "All Party Games" (h1)                          │
│ Subtitle: "Choose a game to play locally or online"    │
├────────────────────────────────────────────────────────┤
│ FILTER BAR:                                            │
│ [All] [Couples] [Party] [Icebreaker] [Drinking] [18+]   │
├────────────────────────────────────────────────────────┤
│ GAME CARDS GRID (2-col Mobile, 3-col Desktop)          │
│ ┌──────────────────────┐    ┌──────────────────────┐   │
│ │ TRUTH OR DARE        │    │ SPINNER WHEEL        │   │
│ │ 3D card flip action  │    │ Digital bottle spin  │   │
│ │ 👥 2-20 • 🌶️ Lvl 1-5│    │ 👥 2-20 • 🌶️ Lvl 1-3│   │
│ │ [ PLAY NOW ]         │    │ [ PLAY NOW ]         │   │
│ └──────────────────────┘    └──────────────────────┘   │
│ ┌──────────────────────┐    ┌──────────────────────┐   │
│ │ NEVER HAVE I EVER    │    │ WOULD YOU RATHER     │   │
│ │ 10 fingers down      │    │ Dilemmas with % stats│   │
│ │ 👥 3-15 • 🌶️ Lvl 1-4│    │ 👥 2-10 • 🌶️ Lvl 1-3│   │
│ │ [ PLAY NOW ]         │    │ [ PLAY NOW ]         │   │
│ └──────────────────────┘    └──────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

### Screen 03: Truth or Dare Setup
* **Route:** `/games/truth-or-dare/setup`
* **Purpose:** Pre-game configuration for selecting game mode, deck intensity, adding player roster names, and configuring timers.
* **Layout Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│ [✕ Back to Directory]                [Step 1 of 2]     │
│ Title: "Setup Your Game"                               │
├────────────────────────────────────────────────────────┤
│ 1. CHOOSE YOUR DECK (5 Cards Grid):                    │
│  [✓ Classic Party]   [Couples Flirty]   [Teens Hangout]│
│  [Family Clean]      [Spicy 18+ (Age Gate)]            │
├────────────────────────────────────────────────────────┤
│ 2. PLAYER ROSTER (Pass & Play Mode):                   │
│  Input: [ Enter player name... ]  [ + Add ]            │
│  Chips: (Alex ✕) (Maya ✕) (Jordan ✕) (Sarah ✕)         │
├────────────────────────────────────────────────────────┤
│ 3. DARE TIMER SETTINGS:                                │
│  [ Off ]  [ 15s ]  [ 30s (Default) ]  [ 60s ]          │
├────────────────────────────────────────────────────────┤
│ [ START GAME (4 Players • Classic Party) ] (Full Width)│
└────────────────────────────────────────────────────────┘
```

---

### Screen 04: Truth or Dare Gameplay (Distraction-Free)
* **Route:** `/games/truth-or-dare/play`
* **Purpose:** The core distraction-free game arena. Clean, immersive, and focused entirely on the active player and prompt.
* **Layout Wireframe:**
```
┌────────────────────────────────────────────────────────┐
│ [✕ Exit]     [Turn 4 • Sarah's Turn]     [🔊 Mute]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│          ┌──────────────────────────────────┐          │
│          │        3D CARD CONTAINER         │          │
│          │                                  │          │
│          │   [CLASSIC PARTY • LEVEL 2]      │          │
│          │                                  │          │
│          │   "What is the single most       │          │
│          │    embarrassing text you have    │          │
│          │    sent to the wrong person?"    │          │
│          │                                  │          │
│          │     [ ⭕ Timer: 24s Ticking ]    │          │
│          └──────────────────────────────────┘          │
│                                                        │
├────────────────────────────────────────────────────────┤
│ PRE-FLIP SELECTION (When Face Down):                   │
│   [ ? TRUTH (Cyan Glow) ]    [ ⚡ DARE (Coral Glow) ]  │
├────────────────────────────────────────────────────────┤
│ POST-FLIP ACTIONS (When Face Up):                      │
│   [ ✕ Skip / Veto ]              [ ✓ Completed (+1) ]  │
│                                                        │
│ [ Next Player: Jordan -> ] (Bottom Floating Pill)      │
└────────────────────────────────────────────────────────┘
```
* **Visual States:**
  * Pre-Flip: Card is face down showing glowing dual split surfaces.
  * Post-Flip: 3D perspective flip reveals prompt with dynamic ambient glow matching choice.
  * Controls: Complete button triggers confetti burst and victory chime.

---

### Screen 05: Spinner Wheel
* **Route:** `/games/spin-the-bottle`
* **Purpose:** Virtual spinning bottle or custom segmented wheel for player selection or dare forfeits.
* **Components:** Central Canvas rendering a rotating 3D bottle over a rich wood/felt party table texture, or a multi-colored neon prize wheel with player name segments. Bottom "TAP OR SWIPE TO SPIN" button with physics friction slider.

---

### Screen 06: Never Have I Ever
* **Route:** `/games/never-have-i-ever`
* **Purpose:** Group confession game with life/finger counters.
* **Components:** Card displaying prompt (*"Never have I ever lied on my resume"*), two large tactile response buttons: **"I HAVE (-1 Life)"** (Red) vs. **"I NEVER"** (Green). Header displays 10 animated heart/finger icons that crack and drop when "I HAVE" is tapped.

---

### Screen 07: Would You Rather
* **Route:** `/games/would-you-rather`
* **Purpose:** Dilemma choice game with real-time community statistics reveal.
* **Components:** Split-screen dual card presentation. Top card: Option A (Cyan theme). Bottom card: Option B (Violet theme). Tapping an option locks the card and triggers an animated count-up bar showing global aggregate percentages.

---

### Screen 08: Most Likely To
* **Route:** `/games/most-likely-to`
* **Purpose:** Synchronized voting game for friend groups.
* **Components:** Prompt displayed (*"Who is most likely to survive a zombie apocalypse?"*). Below prompt: Avatar grid of all players in the room. Participants secretly tap a player. A 15-second countdown ends with an animated gold crown descending onto the winner's avatar.

---

### Screen 09: This or That
* **Route:** `/games/this-or-that`
* **Purpose:** Rapid-fire 60-second preference swipe gauntlet.
* **Components:** Central card stack with swipeable gestures. Swipe left for Option A, swipe right for Option B. Top timer bar ticks down from 60s. End-of-round summary reveals speed stats and compatibility score.

---

### Screen 10: Multiplayer Room
* **Route:** `/room/[code]`
* **Purpose:** Real-time lobby and live game synchronization hub for multi-device parties.
* **Components:**
  * Header: Room code pill (`ROOM: PARTY7`) with 1-tap copy, QR modal toggle, player count (`4/20`).
  * Lobby View: Live avatar grid showing player presence (Host badge, Green active dots).
  * In-Game View: Synchronized card reveal arena with floating live reaction emoji triggers (🔥, 😂, 😱, 👏) on the right rail.
  * Consensus Voting Overlay: Modal asking *"Did Alex complete the dare?"* with "Passed" and "Chickened Out" buttons.

---

### Screen 11: Custom Question Creator
* **Route:** `/custom`
* **Purpose:** Local client-side deck builder allowing users to write, edit, and play custom decks.
* **Components:** Deck Name input, Category tag dropdown, Prompts list table with "+ Add Truth" and "+ Add Dare" quick fields. Cards counter (*"8 cards added — minimum 5 to play"*). Export/Import JSON modals.

---

### Screen 12: Game Result & Leaderboard
* **Route:** `/games/[game]/results`
* **Purpose:** Celebratory summary modal concluding a session.
* **Components:** Confetti particle background, "Party Complete!" banner, MVP Player Trophy award, Leaderboard table (Rank, Player Name, Dares Completed, Truths Answered, Skips). Action buttons: "Reshuffle & Play Again" and "Choose New Game".

---

### Screen 13: Question Library
* **Route:** `/questions`
* **Purpose:** Searchable and filterable public repository of curated party questions for offline play or browsing.
* **Components:** Search bar, category pill tabs, card grid with 1-tap "Copy to Clipboard" buttons and "Launch this Prompt in Game" links.

---

### Screen 14: Blog Listing
* **Route:** `/blog`
* **Purpose:** Editorial content hub for party guides, rules, and SEO articles.
* **Components:** Featured hero article card, category filter (Party Tips, Couples Advice, Game Rules), 3-column responsive card grid with reading time and publish dates.

---

### Screen 15: Blog Article
* **Route:** `/blog/[slug]`
* **Purpose:** High-readability editorial page with embedded interactive party game widgets.
* **Components:** Breadcrumb navigation, publication metadata, clean typography (`max-w-2xl` reading column), embedded interactive Truth or Dare playable widget, and social share buttons.

---

### Screen 16: About Page
* **Route:** `/about`
* **Purpose:** Brand origin, team mission, and platform safety commitments.
* **Components:** Hero mission statement ("Why we built Asteria"), Value proposition cards (Zero Ads, Real-Time WebSync, Safety First), and creator support section.

---

### Screen 17: Contact Page
* **Route:** `/contact`
* **Purpose:** User support, custom deck submissions, and business inquiries.
* **Components:** Contact form with input validation (Name, Email, Subject, Message), FAQ quick links, and community support links.

---

### Screen 18: Privacy Policy
* **Route:** `/privacy`
* **Purpose:** GDPR/CCPA compliant privacy declaration.
* **Components:** Structured legal text with sticky left sidebar table of contents, declaring zero unnecessary PII collection, client-side storage usage, and cookie transparency.

---

### Screen 19: Terms of Service
* **Route:** `/terms`
* **Purpose:** User agreements, content ownership, and safety disclaimers.
* **Components:** Structured legal text detailing voluntary participation, safety disclaimers (users are never forced to perform physical dares), and intellectual property protection.

---

### Screen 20: Admin Dashboard
* **Route:** `/admin`
* **Purpose:** Internal operational portal for content managers and safety moderators.
* **Components:**
  * Metrics Overview Cards: Total Questions in DB, Pending Community Submissions, Active Rooms.
  * Moderation Queue Table: Prompt text, submitted category, safety score, with 1-click "Approve", "Edit", or "Reject" actions.
  * Tag & Deck Manager: Bulk assignment of intensity levels (1–5) and content warnings.

