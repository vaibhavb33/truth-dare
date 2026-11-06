-- ============================================================================
-- PROJECT ASTERIA — PRODUCTION DATABASE SCHEMA MIGRATION
-- Database: PostgreSQL 15+ / Supabase
-- Author: Senior Full-Stack Architect & CTO
-- Date: November 2026
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Anonymous & Authenticated Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{"sound": true, "haptics": true, "theme": "dark", "safe_mode": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAMES CATALOG
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    min_players INT DEFAULT 2,
    max_players INT DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GAME CATEGORIES / DECKS
CREATE TABLE IF NOT EXISTS game_categories (
    id VARCHAR(50) PRIMARY KEY,
    game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    intensity_level INT DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 5),
    is_nsfw BOOLEAN DEFAULT false,
    icon_name VARCHAR(50) DEFAULT 'Sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(50) REFERENCES games(id) ON DELETE CASCADE,
    category_id VARCHAR(50) REFERENCES game_categories(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('truth', 'dare', 'question', 'dilemma', 'statement')),
    prompt TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    intensity INT DEFAULT 1 CHECK (intensity BETWEEN 1 AND 5),
    is_nsfw BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    locale VARCHAR(10) DEFAULT 'en',
    likes_count INT DEFAULT 0,
    plays_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MULTIPLAYER ROOMS
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    game_id VARCHAR(50) REFERENCES games(id),
    category_id VARCHAR(50) REFERENCES game_categories(id),
    host_id UUID REFERENCES profiles(id),
    status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'in_game', 'paused', 'finished')),
    active_player_id UUID,
    current_card_id UUID REFERENCES questions(id),
    is_card_flipped BOOLEAN DEFAULT false,
    timer_seconds INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours')
);

-- 6. ROOM PLAYERS
CREATE TABLE IF NOT EXISTS room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    score INT DEFAULT 0,
    skips INT DEFAULT 0,
    is_host BOOLEAN DEFAULT false,
    is_connected BOOLEAN DEFAULT true,
    avatar_color VARCHAR(20) DEFAULT '#8B5CF6',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, profile_id)
);

-- 7. CUSTOM QUESTIONS (User Created)
CREATE TABLE IF NOT EXISTS custom_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    game_id VARCHAR(50) REFERENCES games(id),
    type VARCHAR(20) NOT NULL,
    prompt TEXT NOT NULL,
    intensity INT DEFAULT 1,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INDEXES FOR HIGH-THROUGHPUT REAL-TIME ACCESS
CREATE INDEX IF NOT EXISTS idx_questions_lookup ON questions(game_id, category_id, type, intensity);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON multiplayer_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_expiry ON multiplayer_rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_room_players ON room_players(room_id, is_connected);

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE multiplayer_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;

-- Public can read questions and games
CREATE POLICY "Public questions are viewable by everyone" ON questions FOR SELECT USING (true);
CREATE POLICY "Public games are viewable by everyone" ON games FOR SELECT USING (is_active = true);
CREATE POLICY "Public categories are viewable by everyone" ON game_categories FOR SELECT USING (true);

-- Room RLS: Anyone can view active non-expired rooms
CREATE POLICY "Public rooms are viewable by code" ON multiplayer_rooms FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Players can update their own room" ON multiplayer_rooms FOR UPDATE USING (true);
CREATE POLICY "Players can view room members" ON room_players FOR SELECT USING (true);

