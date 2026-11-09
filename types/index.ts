export type GameType = 
  | 'truth-or-dare' 
  | 'spin-the-bottle' 
  | 'never-have-i-ever' 
  | 'would-you-rather' 
  | 'most-likely-to' 
  | 'this-or-that';

export type QuestionCategory = 
  | 'funny-truth'
  | 'funny-dare'
  | 'friendship'
  | 'couples'
  | 'romantic'
  | 'awkward'
  | 'embarrassing'
  | 'personal'
  | 'family-friendly'
  | 'party'
  | 'teen-friendly'
  | 'icebreaker'
  | 'creative-challenges'
  // Legacy preset mappings for backward compatibility
  | 'classic-party' 
  | 'couples-flirty' 
  | 'teens-hangout' 
  | 'family-kids' 
  | 'spicy-18' 
  | 'deep-talk'
  | 'deep-secrets'
  | 'wild-party'
  | 'extreme'
  | 'custom';

export type CategoryId = QuestionCategory;

export type QuestionType = 
  | 'truth' 
  | 'dare' 
  | 'never_have_i_ever' 
  | 'would_you_rather' 
  | 'most_likely_to' 
  | 'this_or_that';

export type ContentRating = 'G' | 'PG-13' | 'R-18';
export type AgeGroup = 'kids' | 'teens' | 'adults' | 'all-ages';
export type SupportedLanguageCode = 'en' | 'hi' | 'es' | 'pt' | 'fr' | 'id' | 'ar' | 'de';

export interface Question {
  id: string;
  game_type?: GameType;
  question_type?: QuestionType;
  language_code?: SupportedLanguageCode;
  category?: QuestionCategory;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  question_text?: string;
  content_rating?: ContentRating;
  age_group?: AgeGroup;
  is_active?: boolean;
  safety_reviewed?: boolean;
  created_at?: string;
  tags?: string[];

  // Backward compatibility alias getters/fields:
  prompt: string;
  gameId: GameType;
  categoryId: CategoryId;
  type: QuestionType;
  intensity: 1 | 2 | 3 | 4 | 5;
  isNsfw: boolean;
  optionA?: string;
  optionB?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  skips: number;
  avatarColor?: string;
  isHost?: boolean;
  isConnected?: boolean;
  lastSeenAt?: number;
  sessionToken?: string;
  lives?: number; // For Never Have I Ever (default: 10)
}

export interface GameSettings {
  timerSeconds: 0 | 15 | 30 | 60;
  allowSkips: boolean;
  drinkingMode: boolean;
  familySafeMode: boolean;
  language?: SupportedLanguageCode;
}

export interface GameSessionState {
  gameId: GameType;
  categoryId: CategoryId;
  roster: Player[];
  activePlayerIndex: number;
  currentCard: Question | null;
  isCardFlipped: boolean;
  roundNumber: number;
  drawnCardIds: string[];
  isDeckExhausted: boolean;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  settings: GameSettings;
}

export type RoomLifecycleStatus =
  | 'CREATING'
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'lobby'
  | 'in_game'
  | 'finished';

export type RoomErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_EXPIRED'
  | 'ROOM_FULL'
  | 'ROOM_CLOSED'
  | 'INVALID_ROOM_CODE'
  | 'NETWORK_UNAVAILABLE'
  | 'PERMISSION_DENIED';

export interface MultiplayerRoom {
  id: string; // Canonical UUID
  roomCode: string; // 6-character uppercase alphanumeric code
  gameId: GameType;
  categoryId: CategoryId;
  hostPlayerId: string;
  status: RoomLifecycleStatus;
  players: Player[];
  playerCount?: number;
  activePlayerId: string;
  currentCard: Question | null;
  isCardFlipped: boolean;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  roundNumber: number;
  maxPlayers: number;
  votes: Record<string, string>; // playerId -> vote ('pass' | 'fail' | 'optionA' | 'optionB')
  recentEmojis: Array<{ id: string; emoji: string; timestamp: number; playerName: string }>;
  language: SupportedLanguageCode; // Room question language selected by the host
  customDeckSnapshot?: {
    id: string;
    deckId?: string;
    roomId?: string;
    version?: number;
    name: string;
    language: SupportedLanguageCode;
    questions: CustomQuestion[];
    truthQuestions?: CustomQuestion[];
    dareQuestions?: CustomQuestion[];
    snapshotCreatedAt?: number;
  } | null;
  questionHistory?: RoomQuestionHistoryEntry[];
  createdAt: number; // UTC timestamp milliseconds
  updatedAt: number; // UTC timestamp milliseconds
  expiresAt: number; // UTC timestamp milliseconds
  createdAtIso?: string; // ISO 8601 UTC string
  expiresAtIso?: string; // ISO 8601 UTC string
}

export interface RoomQuestionHistoryEntry {
  id: string;
  questionId: string;
  type: QuestionType;
  prompt: string;
  playerId: string;
  playerName: string;
  action: 'completed' | 'skipped' | 'flipped';
  timestamp: number;
}

export interface CustomQuestion {
  id: string;
  type: 'truth' | 'dare';
  prompt: string;
  intensity?: number;
}

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  language: SupportedLanguageCode;
  category: CategoryId;
  visibility: 'private' | 'unlisted' | 'public';
  creatorId: string;
  version?: number;
  questions: CustomQuestion[];
  createdAt: number;
  updatedAt: number;
}
