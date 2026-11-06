import { QuestionCategory } from '@/types';

export interface CategoryMetadata {
  id: QuestionCategory;
  name: string;
  icon: string;
  description: string;
  contentRating: 'G' | 'PG-13' | 'R-18';
  defaultAgeGroup: 'kids' | 'teens' | 'adults' | 'all-ages';
}

export const QUESTION_CATEGORIES: Record<string, CategoryMetadata> = {
  'funny-truth': {
    id: 'funny-truth',
    name: 'Funny Truth',
    icon: '😂',
    description: 'Hilarious confessions, bizarre habits, and goofy memories.',
    contentRating: 'G',
    defaultAgeGroup: 'all-ages',
  },
  'funny-dare': {
    id: 'funny-dare',
    name: 'Funny Dare',
    icon: '🤪',
    description: 'Silly impressions, goofy physical stunts, and comedic acts.',
    contentRating: 'G',
    defaultAgeGroup: 'all-ages',
  },
  'friendship': {
    id: 'friendship',
    name: 'Friendship',
    icon: '🤝',
    description: 'Group loyalty, secrets among close friends, and bond testing.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'all-ages',
  },
  'couples': {
    id: 'couples',
    name: 'Couples',
    icon: '💑',
    description: 'Relationship dynamics, cute sparks, and honest partner checks.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'adults',
  },
  'romantic': {
    id: 'romantic',
    name: 'Romantic',
    icon: '❤️',
    description: 'Flirty chemistry, dream dates, and confession of crushes.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'teens',
  },
  'awkward': {
    id: 'awkward',
    name: 'Awkward',
    icon: '😬',
    description: 'Cringe moments, unintentional blunders, and uncomfortable situations.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'all-ages',
  },
  'embarrassing': {
    id: 'embarrassing',
    name: 'Embarrassing',
    icon: '😳',
    description: 'Blushing moments, secret fails, and stories you rarely tell.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'all-ages',
  },
  'personal': {
    id: 'personal',
    name: 'Personal',
    icon: '🤫',
    description: 'Deep reflections, philosophy, secret hopes, and genuine vulnerability.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'all-ages',
  },
  'family-friendly': {
    id: 'family-friendly',
    name: 'Family Friendly',
    icon: '🌟',
    description: '100% wholesome, safe for parents, siblings, and kids of all ages.',
    contentRating: 'G',
    defaultAgeGroup: 'kids',
  },
  'party': {
    id: 'party',
    name: 'Party',
    icon: '🎉',
    description: 'High energy group challenges, room roars, and party ignition.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'all-ages',
  },
  'teen-friendly': {
    id: 'teen-friendly',
    name: 'Teen Friendly',
    icon: '🍕',
    description: 'School gossip, group chats, crushes, and sleepover energy.',
    contentRating: 'PG-13',
    defaultAgeGroup: 'teens',
  },
  'icebreaker': {
    id: 'icebreaker',
    name: 'Icebreaker',
    icon: '🧊',
    description: 'Zero pressure conversation starters for new friends and groups.',
    contentRating: 'G',
    defaultAgeGroup: 'all-ages',
  },
  'creative-challenges': {
    id: 'creative-challenges',
    name: 'Creative Challenges',
    icon: '🎭',
    description: 'Inventive roleplay, improvised songs, mimicry, and wild acting.',
    contentRating: 'G',
    defaultAgeGroup: 'all-ages',
  },
};

export const ALL_13_CATEGORIES = Object.keys(QUESTION_CATEGORIES) as QuestionCategory[];

/**
 * Maps legacy 5 category presets to corresponding modern categories
 */
export const LEGACY_CATEGORY_MAP: Record<string, QuestionCategory[]> = {
  'classic-party': ['party', 'funny-truth', 'funny-dare', 'icebreaker', 'friendship'],
  'couples-flirty': ['couples', 'romantic', 'personal', 'awkward'],
  'teens-hangout': ['teen-friendly', 'friendship', 'embarrassing', 'creative-challenges'],
  'spicy-18': ['romantic', 'awkward', 'personal', 'party'],
  'family-kids': ['family-friendly', 'icebreaker', 'creative-challenges', 'funny-truth'],
  'deep-talk': ['personal', 'friendship', 'awkward'],
};

