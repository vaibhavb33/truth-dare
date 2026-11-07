# Database & Data Persistence Audit
**Platform:** Asteria Party Gaming Platform (`https://truthordarequiz.com`)  
**Role:** CTO & Senior Full-Stack Architect  
**Date:** November 7, 2026  

---

## 1. Current Data Architecture Overview

Asteria's data layer currently operates in a **hybrid static-and-in-memory architecture**:

```
+--------------------------------------------------------------------------+
|                        ASTERIA DATA ECOSYSTEM                            |
+--------------------------------------------------------------------------+
       |                                      |
       v                                      v
[Static Question Database]           [In-Memory Engine State]
- 2,652 Verified Multilingual Qs     - Active Multiplayer Rooms
- Strict ISO 639-1 Segregation       - Live Player Lists & Turns
- Fast O(1) ID Map Lookups           - Real-time Reaction Emojis
- Localized in TS Bundles            - TTL Cleanup (2 Hours)
       |                                      |
       +-------------------+------------------+
                           |
                           v
            [Supabase / PostgreSQL Schema]
            - Migration Defined: 20261105000000_initial_schema.sql
            - 7 Core Tables with Constraints, Indexes & RLS
            - Status: NOT YET CONNECTED AT RUNTIME
```

---

## 2. PostgreSQL / Supabase Schema Audit

The migration file `supabase/migrations/20261105000000_initial_schema.sql` provides production-grade relational structures:

### Table 1: `profiles`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Columns:** `username` (VARCHAR 50), `avatar_url` (TEXT), `is_anonymous` (BOOLEAN DEFAULT true), `preferences` (JSONB), `created_at`, `updated_at`.
- **Purpose:** Manages player identities, sound settings, theme preferences, and age verification.

### Table 2: `games`
- **Primary Key:** `id VARCHAR(50)` (e.g. `'truth-or-dare'`, `'spin-the-bottle'`)
- **Columns:** `title`, `slug` (UNIQUE), `description`, `min_players`, `max_players`, `is_active`, `sort_order`.
- **Purpose:** Canonical registry for supported game modes.

### Table 3: `game_categories`
- **Primary Key:** `id VARCHAR(50)` (e.g. `'classic-party'`, `'spicy-18'`)
- **Foreign Keys:** `game_id REFERENCES games(id) ON DELETE CASCADE`
- **Columns:** `name`, `slug`, `description`, `intensity_level` (1-5), `is_nsfw`, `icon_name`.
- **Purpose:** Deck classification with intensity and NSFW rating boundaries.

### Table 4: `questions`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Keys:** `game_id REFERENCES games(id)`, `category_id REFERENCES game_categories(id)`
- **Columns:** `type` (`truth`, `dare`, `question`, `dilemma`, `statement`), `prompt`, `option_a`, `option_b`, `intensity`, `is_nsfw`, `tags` (TEXT[]), `locale` (VARCHAR 10), `likes_count`, `plays_count`.
- **Index:** `CREATE INDEX idx_questions_lookup ON questions(game_id, category_id, type, intensity);`

### Table 5: `multiplayer_rooms`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Unique Constraint:** `room_code VARCHAR(6) UNIQUE NOT NULL`
- **Columns:** `game_id`, `category_id`, `host_id`, `status` (`lobby`, `in_game`, `paused`, `finished`), `active_player_id`, `current_card_id`, `is_card_flipped`, `timer_seconds`, `created_at`, `expires_at`.
- **Index:** `CREATE INDEX idx_rooms_code ON multiplayer_rooms(room_code);`

### Table 6: `room_players`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Keys:** `room_id REFERENCES multiplayer_rooms(id)`, `profile_id REFERENCES profiles(id)`
- **Columns:** `name`, `score`, `skips`, `is_host`, `is_connected`, `avatar_color`, `joined_at`.
- **Unique Constraint:** `UNIQUE(room_id, profile_id)`

### Table 7: `custom_questions`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Keys:** `creator_id REFERENCES profiles(id) ON DELETE CASCADE`, `game_id REFERENCES games(id)`
- **Columns:** `type`, `prompt`, `intensity`, `is_private`.

---

## 3. Question Database Inventory (Static Engine)

The static TypeScript question repository in `lib/questions/database/` contains **2,652 original, native-language verified questions**:

| Language Code | Language Name | Truth Questions | Dare Questions | Legacy Seed | Total Verified Count |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **`en`** | English | 300 | 300 | 52 | **652** |
| **`hi`** | Hindi (Devanagari) | 300 | 300 | 0 | **600** |
| **`es`** | Spanish | 150 | 150 | 0 | **300** |
| **`pt`** | Portuguese | 150 | 150 | 0 | **300** |
| **`fr`** | French | 100 | 100 | 0 | **200** |
| **`id`** | Indonesian | 100 | 100 | 0 | **200** |
| **`ar`** | Arabic (RTL) | 100 | 100 | 0 | **200** |
| **`de`** | German | 100 | 100 | 0 | **200** |
| **TOTAL** | **8 Languages** | **1,300** | **1,300** | **52** | **2,652 Items** |

### Question Integrity Checks:
- **Zero ID Collisions:** All 2,652 items have cryptographically unique UUID/prefixed identifiers.
- **Strict Category Mapping:** Every question maps to an approved category: `classic-party`, `couples-flirty`, `teens-hangout`, `spicy-18`, or `family-kids`.
- **Language Segregation:** English fallback is strictly forbidden for non-English locales; language queries return strictly native content.

---

## 4. Architectural Gap Analysis & Upgrade Recommendations

| Current Implementation | Architectural Limitation | Recommended Target Upgrade |
| :--- | :--- | :--- |
| **In-Memory Rooms (`roomEngine.ts`)** | Lost on process restart; broken across multi-instance serverless Lambdas. | Persist rooms in Supabase PostgreSQL with Redis caching layer or Supabase Realtime Channels. |
| **Client HTTP Polling (1.5s interval)** | Unnecessary server bandwidth, high latency (up to 1,500ms), mobile battery drain. | Replace with WebSockets or Supabase Realtime broadcast channels for sub-50ms turn synchronization. |
| **LocalStorage Custom Decks** | Custom decks cannot be shared with friends or used in multiplayer rooms. | Sync custom decks to `custom_questions` table with shareable deck tokens/slugs. |
| **Static Question Bundles** | Adding questions requires recompiling the Next.js production build. | Seed `questions` table with the 2,652 static items and enable real-time admin CRUD in Supabase. |
