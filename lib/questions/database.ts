import { Question } from '@/types';

export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // 1. TRUTH OR DARE — CLASSIC PARTY (PG-13)
  // ==========================================
  {
    id: 'tod-cp-t-01',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What is the most awkward lie you told to escape a social gathering early?',
    intensity: 2,
    isNsfw: false,
    tags: ['social', 'party', 'confession']
  },
  {
    id: 'tod-cp-t-02',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What is the strangest rabbit hole you went down on Wikipedia or YouTube at 3 AM?',
    intensity: 1,
    isNsfw: false,
    tags: ['funny', 'internet']
  },
  {
    id: 'tod-cp-t-03',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'If you could swap lives with anyone in this room for 24 hours, who would it be and why?',
    intensity: 2,
    isNsfw: false,
    tags: ['group', 'friendship']
  },
  {
    id: 'tod-cp-t-04',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What childish habit or comfort item do you secretly still indulge in?',
    intensity: 1,
    isNsfw: false,
    tags: ['childhood', 'quirky']
  },
  {
    id: 'tod-cp-t-05',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What was your absolute worst haircut or fashion disaster phase in life?',
    intensity: 2,
    isNsfw: false,
    tags: ['nostalgia', 'embarrassing']
  },
  {
    id: 'tod-cp-t-06',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What is something you pretend to understand in conversations but actually have no clue about?',
    intensity: 2,
    isNsfw: false,
    tags: ['relatable', 'confession']
  },
  {
    id: 'tod-cp-t-07',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'Who was your most embarrassing celebrity crush when you were growing up?',
    intensity: 1,
    isNsfw: false,
    tags: ['crush', 'pop-culture']
  },
  {
    id: 'tod-cp-t-08',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'truth',
    prompt: 'What is the petty hill that you are genuinely willing to die on?',
    intensity: 2,
    isNsfw: false,
    tags: ['debates', 'opinions']
  },
  {
    id: 'tod-cp-d-01',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Speak in a dramatic Shakespearean or pirate accent for your next two turns.',
    intensity: 2,
    isNsfw: false,
    tags: ['acting', 'funny']
  },
  {
    id: 'tod-cp-d-02',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Let the player to your left style your hair however they want for the next 15 minutes.',
    intensity: 2,
    isNsfw: false,
    tags: ['physical', 'styling']
  },
  {
    id: 'tod-cp-d-03',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Do your absolute best impression of another player in the room until someone guesses who it is.',
    intensity: 2,
    isNsfw: false,
    tags: ['impressions', 'humor']
  },
  {
    id: 'tod-cp-d-04',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Send a voice note to a mutual friend singing the chorus of a dramatic 80s love ballad.',
    intensity: 3,
    isNsfw: false,
    tags: ['social', 'singing']
  },
  {
    id: 'tod-cp-d-05',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Deliver an impassioned 60-second TED Talk on why pineapples belong (or do not belong) on pizza.',
    intensity: 2,
    isNsfw: false,
    tags: ['timed', 'speech']
  },
  {
    id: 'tod-cp-d-06',
    gameId: 'truth-or-dare',
    categoryId: 'classic-party',
    type: 'dare',
    prompt: 'Show the 5th photo in your phone camera roll without giving any prior context or explanation.',
    intensity: 3,
    isNsfw: false,
    tags: ['phone', 'reveal']
  },

  // ==========================================
  // 2. TRUTH OR DARE — COUPLES & FLIRTY
  // ==========================================
  {
    id: 'tod-cf-t-01',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'truth',
    prompt: 'What was the exact thought that crossed your mind the first 30 seconds we met?',
    intensity: 2,
    isNsfw: false,
    tags: ['first-impression', 'romance']
  },
  {
    id: 'tod-cf-t-02',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'truth',
    prompt: 'What is one tiny, everyday habit of mine that you secretly find irresistible?',
    intensity: 2,
    isNsfw: false,
    tags: ['flirty', 'intimacy']
  },
  {
    id: 'tod-cf-t-03',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'truth',
    prompt: 'What is a romantic destination or crazy adventure you secretly dream of us doing together?',
    intensity: 2,
    isNsfw: false,
    tags: ['dreams', 'adventure']
  },
  {
    id: 'tod-cf-t-04',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'truth',
    prompt: 'When was the exact moment you realized you had real feelings for me?',
    intensity: 3,
    isNsfw: false,
    tags: ['vulnerability', 'milestones']
  },
  {
    id: 'tod-cf-t-05',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'truth',
    prompt: 'What song immediately makes you think of our relationship every time it plays?',
    intensity: 1,
    isNsfw: false,
    tags: ['music', 'nostalgia']
  },
  {
    id: 'tod-cf-d-01',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'dare',
    prompt: 'Maintain unbroken eye contact with your partner for 45 seconds without laughing or speaking.',
    intensity: 3,
    isNsfw: false,
    tags: ['intimacy', 'timed']
  },
  {
    id: 'tod-cf-d-02',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'dare',
    prompt: 'Whisper three genuine compliments in your partner’s ear, each starting with the letter of their initials.',
    intensity: 3,
    isNsfw: false,
    tags: ['sweet', 'verbal']
  },
  {
    id: 'tod-cf-d-03',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'dare',
    prompt: 'Give your partner a 60-second relaxing shoulder or neck massage with full concentration.',
    intensity: 3,
    isNsfw: false,
    tags: ['touch', 'massage']
  },
  {
    id: 'tod-cf-d-04',
    gameId: 'truth-or-dare',
    categoryId: 'couples-flirty',
    type: 'dare',
    prompt: 'Re-enact your favorite romantic movie scene together right now.',
    intensity: 2,
    isNsfw: false,
    tags: ['acting', 'fun']
  },

  // ==========================================
  // 3. TRUTH OR DARE — SPICY / AFTER DARK 18+
  // ==========================================
  {
    id: 'tod-sp-t-01',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'truth',
    prompt: 'What is your boldest turn-on that you rarely admit out loud?',
    intensity: 4,
    isNsfw: true,
    tags: ['spicy', 'adult']
  },
  {
    id: 'tod-sp-t-02',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'truth',
    prompt: 'Have you ever sent a risky photo and immediately panicked right after hitting send?',
    intensity: 4,
    isNsfw: true,
    tags: ['confession', 'phone']
  },
  {
    id: 'tod-sp-t-03',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'truth',
    prompt: 'What is the most adventurous place you have ever kissed someone?',
    intensity: 4,
    isNsfw: true,
    tags: ['adventure', 'kiss']
  },
  {
    id: 'tod-sp-t-04',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'truth',
    prompt: 'If you had to pick one person in this room to be stranded with in a luxury hotel suite, who is it?',
    intensity: 4,
    isNsfw: true,
    tags: ['group', 'bold']
  },
  {
    id: 'tod-sp-d-01',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'dare',
    prompt: 'Whisper your most provocative secret into the ear of the person chosen by the room.',
    intensity: 5,
    isNsfw: true,
    tags: ['secret', 'bold']
  },
  {
    id: 'tod-sp-d-02',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'dare',
    prompt: 'Slow dance with the player to your right for 30 seconds to whatever music the group plays.',
    intensity: 4,
    isNsfw: true,
    tags: ['dance', 'physical']
  },
  {
    id: 'tod-sp-d-03',
    gameId: 'truth-or-dare',
    categoryId: 'spicy-18',
    type: 'dare',
    prompt: 'Take a sip of your drink without using your hands, or take two sips as a penalty forfeit.',
    intensity: 4,
    isNsfw: true,
    tags: ['drinking', 'challenge']
  },

  // ==========================================
  // 4. TRUTH OR DARE — FAMILY & KIDS (100% CLEAN)
  // ==========================================
  {
    id: 'tod-fk-t-01',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'truth',
    prompt: 'If you could invent a brand new holiday with no school or work, what would we celebrate?',
    intensity: 1,
    isNsfw: false,
    tags: ['family', 'kids', 'imagination']
  },
  {
    id: 'tod-fk-t-02',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'truth',
    prompt: 'What is the silliest thing you have ever convinced someone younger than you to believe?',
    intensity: 1,
    isNsfw: false,
    tags: ['family', 'funny']
  },
  {
    id: 'tod-fk-t-03',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'truth',
    prompt: 'If you could turn into any wild animal for 1 hour, which animal would you pick and why?',
    intensity: 1,
    isNsfw: false,
    tags: ['animals', 'creative']
  },
  {
    id: 'tod-fk-d-01',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'dare',
    prompt: 'Do your best impression of a rooster crowing at sunrise until the room gives you a thumbs up.',
    intensity: 1,
    isNsfw: false,
    tags: ['funny', 'kids']
  },
  {
    id: 'tod-fk-d-02',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'dare',
    prompt: 'Balance a small book or spoon on your head and walk across the room without dropping it.',
    intensity: 1,
    isNsfw: false,
    tags: ['balance', 'game']
  },
  {
    id: 'tod-fk-d-03',
    gameId: 'truth-or-dare',
    categoryId: 'family-kids',
    type: 'dare',
    prompt: 'Invent a funny secret handshake with the person sitting across from you.',
    intensity: 1,
    isNsfw: false,
    tags: ['friendly', 'handshake']
  },

  // ==========================================
  // 5. NEVER HAVE I EVER
  // ==========================================
  {
    id: 'nhie-01',
    gameId: 'never-have-i-ever',
    categoryId: 'classic-party',
    type: 'never_have_i_ever',
    prompt: 'Never have I ever stalked an ex’s profile and accidentally liked a photo from three years ago.',
    intensity: 2,
    isNsfw: false,
    tags: ['social-media', 'confession']
  },
  {
    id: 'nhie-02',
    gameId: 'never-have-i-ever',
    categoryId: 'classic-party',
    type: 'never_have_i_ever',
    prompt: 'Never have I ever blamed a weird smell or noisy mishap on the family pet.',
    intensity: 1,
    isNsfw: false,
    tags: ['humor', 'family']
  },
  {
    id: 'nhie-03',
    gameId: 'never-have-i-ever',
    categoryId: 'classic-party',
    type: 'never_have_i_ever',
    prompt: 'Never have I ever pretended to be texting or on a call just to avoid an awkward conversation.',
    intensity: 1,
    isNsfw: false,
    tags: ['relatable', 'introvert']
  },
  {
    id: 'nhie-04',
    gameId: 'never-have-i-ever',
    categoryId: 'classic-party',
    type: 'never_have_i_ever',
    prompt: 'Never have I ever re-gifted a present to someone else in the exact same friend group.',
    intensity: 2,
    isNsfw: false,
    tags: ['gifts', 'scandal']
  },
  {
    id: 'nhie-05',
    gameId: 'never-have-i-ever',
    categoryId: 'classic-party',
    type: 'never_have_i_ever',
    prompt: 'Never have I ever sung in the shower at full volume pretending I was headlining a stadium concert.',
    intensity: 1,
    isNsfw: false,
    tags: ['music', 'funny']
  },

  // ==========================================
  // 6. WOULD YOU RATHER
  // ==========================================
  {
    id: 'wyr-01',
    gameId: 'would-you-rather',
    categoryId: 'classic-party',
    type: 'would_you_rather',
    prompt: 'Would You Rather: Always have to sing your thoughts out loud OR have everyone hear what you search online?',
    optionA: 'Sing your thoughts out loud',
    optionB: 'Broadcast your web search history',
    intensity: 2,
    isNsfw: false,
    tags: ['dilemma', 'funny']
  },
  {
    id: 'wyr-02',
    gameId: 'would-you-rather',
    categoryId: 'classic-party',
    type: 'would_you_rather',
    prompt: 'Would You Rather: Have the ability to speak every human language OR talk to all animals fluently?',
    optionA: 'Speak every human language',
    optionB: 'Talk to animals',
    intensity: 1,
    isNsfw: false,
    tags: ['superpower', 'creative']
  },
  {
    id: 'wyr-03',
    gameId: 'would-you-rather',
    categoryId: 'classic-party',
    type: 'would_you_rather',
    prompt: 'Would You Rather: Travel 100 years into the past OR travel 100 years into the future?',
    optionA: '100 years into the past',
    optionB: '100 years into the future',
    intensity: 2,
    isNsfw: false,
    tags: ['time-travel', 'sci-fi']
  },
  {
    id: 'wyr-04',
    gameId: 'would-you-rather',
    categoryId: 'classic-party',
    type: 'would_you_rather',
    prompt: 'Would You Rather: Never be able to drink coffee/tea again OR never be able to eat chocolate/desserts again?',
    optionA: 'No coffee or tea ever',
    optionB: 'No chocolate or desserts ever',
    intensity: 2,
    isNsfw: false,
    tags: ['food', 'tough']
  },

  // ==========================================
  // 7. MOST LIKELY TO
  // ==========================================
  {
    id: 'mlt-01',
    gameId: 'most-likely-to',
    categoryId: 'classic-party',
    type: 'most_likely_to',
    prompt: 'Who is most likely to win the lottery and somehow lose the ticket before cashing it in?',
    intensity: 1,
    isNsfw: false,
    tags: ['absurd', 'humor']
  },
  {
    id: 'mlt-02',
    gameId: 'most-likely-to',
    categoryId: 'classic-party',
    type: 'most_likely_to',
    prompt: 'Who is most likely to end up accidentally becoming a famous meme on TikTok?',
    intensity: 1,
    isNsfw: false,
    tags: ['viral', 'internet']
  },
  {
    id: 'mlt-03',
    gameId: 'most-likely-to',
    categoryId: 'classic-party',
    type: 'most_likely_to',
    prompt: 'Who is most likely to spend an entire month’s paycheck on a crazy spontaneous impulse buy?',
    intensity: 2,
    isNsfw: false,
    tags: ['money', 'spontaneous']
  },
  {
    id: 'mlt-04',
    gameId: 'most-likely-to',
    categoryId: 'classic-party',
    type: 'most_likely_to',
    prompt: 'Who is most likely to accidentally survive a real-life zombie apocalypse through pure luck?',
    intensity: 1,
    isNsfw: false,
    tags: ['survival', 'fun']
  },

  // ==========================================
  // 8. THIS OR THAT
  // ==========================================
  {
    id: 'tot-01',
    gameId: 'this-or-that',
    categoryId: 'classic-party',
    type: 'this_or_that',
    prompt: 'Choose Your Vibe:',
    optionA: 'Spontaneous Road Trip',
    optionB: 'All-Inclusive Luxury Resort',
    intensity: 1,
    isNsfw: false,
    tags: ['travel', 'lifestyle']
  },
  {
    id: 'tot-02',
    gameId: 'this-or-that',
    categoryId: 'classic-party',
    type: 'this_or_that',
    prompt: 'Choose Your Night:',
    optionA: 'Wild House Party with 50 People',
    optionB: 'Cozy Movie Night with 3 Best Friends',
    intensity: 1,
    isNsfw: false,
    tags: ['social', 'party']
  },
  {
    id: 'tot-03',
    gameId: 'this-or-that',
    categoryId: 'classic-party',
    type: 'this_or_that',
    prompt: 'Choose Your Morning:',
    optionA: 'Sunrise Run & Iced Matcha',
    optionB: 'Sleep in until Noon & Order Brunch',
    intensity: 1,
    isNsfw: false,
    tags: ['morning', 'routine']
  }
];

