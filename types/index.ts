export type GameType = 
  | 'truth-or-dare' 
  | 'spin-the-bottle' 
  | 'never-have-i-ever' 
  | 'would-you-rather' 
  | 'most-likely-to' 
  | 'this-or-that';

export type CategoryId = 
  | 'classic-party' 
  | 'couples-flirty' 
  | 'teens-hangout' 
  | 'family-kids' 
  | 'spicy-18' 
  | 'deep-talk'
  | 'custom';

export type QuestionType = 
  | 'truth' 
  | 'dare' 
  | 'never_have_i_ever' 
  | 'would_you_rather' 
  | 'most_likely_to' 
  | 'this_or_that';

export interface Question {
  id: string;
  gameId: GameType;
  categoryId: CategoryId;
  type: QuestionType;
  prompt: string;
  optionA?: string;
  optionB?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  isNsfw: boolean;
  tags: string[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
  skips: number;
  avatarColor?: string;
  isHost?: boolean;
  isConnected?: boolean;
  lives?: number; // For Never Have I Ever (default: 10)
}

export interface GameSettings {
  timerSeconds: 0 | 15 | 30 | 60;
  allowSkips: boolean;
  drinkingMode: boolean;
  familySafeMode: boolean;
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

export interface MultiplayerRoom {
  roomCode: string;
  gameId: GameType;
  categoryId: CategoryId;
  hostPlayerId: string;
  status: 'lobby' | 'in_game' | 'finished';
  players: Player[];
  activePlayerId: string;
  currentCard: Question | null;
  isCardFlipped: boolean;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  votes: Record<string, string>; // playerId -> vote ('pass' | 'fail' | 'optionA' | 'optionB')
  recentEmojis: Array<{ id: string; emoji: string; timestamp: number; playerName: string }>;
  createdAt: number;
  expiresAt: number;
}

export interface CustomDeck {
  id: string;
  name: string;
  description?: string;
  questions: Array<{
    id: string;
    type: 'truth' | 'dare';
    prompt: string;
  }>;
  createdAt: number;
}

