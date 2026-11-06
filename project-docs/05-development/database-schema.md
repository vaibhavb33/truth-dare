# Database Schema & Data Models Specification

**Project Name:** Project Asteria  
**Document:** PostgreSQL & Supabase Relational Data Architecture  
**Role:** Senior Full-Stack Architect & Lead Developer  
**Date:** November 5, 2026  
**Status:** Approved & Implemented

---

## 1. Relational ERD Topology

The database architecture is structured across 14 tables with strict relational integrity, foreign key cascades, and high-performance B-tree indexes.

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   GAMES     │──────<│ GAME_CATEGORIES │──────<│    QUESTIONS     │
└─────────────┘       └─────────────────┘       └──────────────────┘
       │                                                 │
       │                                                 │
       ▼                                                 ▼
┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐
│QUESTION_PACKS│      │  GAME_SESSIONS  │──────<│ SESSION_QUESTIONS│
└─────────────┘       └────────┬────────┘       └──────────────────┘
                               │
                      ┌────────┴────────┐
                      ▼                 ▼
             ┌─────────────────┐ ┌───────────────┐
             │ SESSION_PLAYERS │ │  GAME_VOTES   │
             └─────────────────┘ └───────────────┘

┌─────────────────┐   ┌─────────────────┐       ┌──────────────────┐
│MULTIPLAYER_ROOMS│──<│  ROOM_PLAYERS   │       │ CUSTOM_QUESTIONS │
└─────────────────┘   └─────────────────┘       └──────────────────┘

┌─────────────────┐   ┌─────────────────┐       ┌──────────────────┐
│    PROFILES     │   │   FAVOURITES    │       │   ADMIN_USERS    │
└─────────────────┘   └─────────────────┘       └──────────────────┘
```

---

## 2. SQL DDL Table Definitions & Constraints

```sql
-- 1. Profiles Table (Anonymous or Authenticated)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{"sound": true, "haptics": true, "theme": "dark", "safe_mode": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Games Catalog
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'truth-or-dare', 'spin-the-bottle'
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    min_players INT DEFAULT 2,
    max_players INT DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Game Categories & Decks
CREATE TABLE IF NOT EXISTS game_categories (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'classic-party', 'couples-flirty'
    game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    intensity_level INT DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 5),
    is_nsfw BOOLEAN DEFAULT false,
    icon_name VARCHAR(50) DEFAULT 'Sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Questions Central Repository
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES game_categories(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('truth', 'dare', 'never_have_i_ever', 'would_you_rather', 'most_likely_to', 'this_or_that')),
    prompt_text TEXT NOT NULL,
    option_a TEXT, -- For Would You Rather / This or That
    option_b TEXT, -- For Would You Rather / This or That
    intensity_level INT DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 5),
    is_safe_for_minors BOOLEAN DEFAULT true,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Curated Question Packs
CREATE TABLE IF NOT EXISTS question_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id VARCHAR(50) REFERENCES game_categories(id),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Game Sessions (Local & Live)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) REFERENCES games(id),
    category_id VARCHAR(50) REFERENCES game_categories(id),
    mode VARCHAR(20) DEFAULT 'pass_and_play',
    current_round INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Session Players
CREATE TABLE IF NOT EXISTS session_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_name VARCHAR(50) NOT NULL,
    score INT DEFAULT 0,
    skips_count INT DEFAULT 0,
    turn_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Session Questions (Anti-Duplication History)
CREATE TABLE IF NOT EXISTS session_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    player_id UUID REFERENCES session_players(id) ON DELETE SET NULL,
    result VARCHAR(20) CHECK (result IN ('completed', 'skipped', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Custom Questions (User Authored)
CREATE TABLE IF NOT EXISTS custom_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    deck_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('truth', 'dare')),
    prompt_text TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Multiplayer Rooms
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    game_id VARCHAR(50) REFERENCES games(id),
    category_id VARCHAR(50) REFERENCES game_categories(id),
    host_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_game', 'expired')),
    current_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    active_player_id UUID,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Room Players (Presence & Roster)
CREATE TABLE IF NOT EXISTS room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    player_name VARCHAR(50) NOT NULL,
    is_host BOOLEAN DEFAULT false,
    is_connected BOOLEAN DEFAULT true,
    score INT DEFAULT 0,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Game Votes (Consensus & Reactions)
CREATE TABLE IF NOT EXISTS game_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    voter_player_id UUID REFERENCES room_players(id) ON DELETE CASCADE,
    vote_choice VARCHAR(50) NOT NULL, -- e.g. 'pass', 'fail', 'option_a', 'option_b'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Favourites
CREATE TABLE IF NOT EXISTS favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, question_id)
);

-- 14. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'moderator' CHECK (role IN ('superadmin', 'editor', 'moderator')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. High-Performance B-Tree Indexes

```sql
CREATE INDEX idx_questions_game_category ON questions(game_id, category_id, intensity_level);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_multiplayer_rooms_code ON multiplayer_rooms(room_code);
CREATE INDEX idx_multiplayer_rooms_status ON multiplayer_rooms(status, expires_at);
CREATE INDEX idx_room_players_room ON room_players(room_id, is_connected);
CREATE INDEX idx_session_questions_session ON session_questions(session_id);
```

---

## 4. Row Level Security (RLS) Policies

* **Questions:** Publicly readable by all (`auth.uid() IS NULL` or authenticated).
* **Multiplayer Rooms:** Readable and joinable by anyone holding the active 6-character `room_code`. Mutatable only by the designated host or connected room players.
* **Custom Questions:** Private to author (`profile_id = auth.uid()`) unless `is_public = true` AND `moderation_status = 'approved'`.
* **Admin Users:** Strictly isolated from public schema access; authenticated exclusively through secure server-side JWT / session validation.

