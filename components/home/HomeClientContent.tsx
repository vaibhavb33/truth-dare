'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Flame,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Volume2,
  ChevronDown,
  HelpCircle,
  Disc,
  Heart,
  QrCode,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { sound } from '@/lib/audio/soundSynthesizer';

export function HomeClientContent() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setJoinError('Please enter a valid 6-character room code.');
      sound.triggerHaptic(25);
      return;
    }
    sound.triggerHaptic(15);
    router.push(`/room/${cleanCode}`);
  };

  const categories = [
    { id: 'classic-party', name: 'Classic Party', icon: '🎉', desc: 'Hilarious, universal icebreakers for everyone', count: '150+ Cards' },
    { id: 'couples-flirty', name: 'Couples & Flirty', icon: '❤️', desc: 'Romantic intimacy and playful sparks', count: '120+ Cards' },
    { id: 'teens-hangout', name: 'Teens & Sleepovers', icon: '🍕', desc: 'Social drama, school gossip and bold dares', count: '110+ Cards' },
    { id: 'spicy-18', name: 'Spicy 18+', icon: '🌶️', desc: 'Adult, wild, provocative late-night challenges', count: '140+ Cards' },
    { id: 'family-kids', name: 'Family Clean', icon: '🌟', desc: '100% wholesome, school-safe challenges for all ages', count: '100+ Cards' },
  ];

  const featuredGames = [
    {
      title: 'Truth or Dare',
      slug: 'truth-or-dare',
      icon: Flame,
      color: 'from-dare-500 to-rose-600',
      badge: 'Most Popular',
      desc: 'The definitive 3D card flipping party game with integrated countdown timer and audio effects.',
    },
    {
      title: 'Spinner Wheel',
      slug: 'spin-the-bottle',
      icon: Disc,
      color: 'from-brand-500 to-indigo-600',
      badge: 'Physics Wheel',
      desc: 'Smooth virtual bottle spinning and custom prize wheel to randomly assign turns and forfeits.',
    },
    {
      title: 'Never Have I Ever',
      slug: 'never-have-i-ever',
      icon: HelpCircle,
      color: 'from-truth-500 to-cyan-600',
      badge: '10 Fingers Down',
      desc: 'Digital life counter confession game with group stats and zero setup needed.',
    },
    {
      title: 'Would You Rather',
      slug: 'would-you-rather',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Live % Stats',
      desc: 'Compelling dilemmas with real-time community vote percentages after every choice.',
    },
    {
      title: 'Most Likely To',
      slug: 'most-likely-to',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      badge: 'Group Voting',
      desc: 'Secret ballot voting where room friends crown the person who fits the wild prompt.',
    },
    {
      title: 'This or That',
      slug: 'this-or-that',
      icon: Zap,
      color: 'from-pink-500 to-rose-600',
      badge: '60s Gauntlet',
      desc: 'Fast-paced mobile swipe preference test for couples, friends, and speed dating.',
    },
  ];

  const faqs = [
    {
      q: 'Is Project Asteria completely free to play?',
      a: 'Yes, 100% free! You can play all core party games, access hundreds of curated cards, and host online multiplayer rooms without paywalls or forced subscriptions.',
    },
    {
      q: 'Do my friends need to download an app or create an account to join?',
      a: 'No app download is required. Guests simply scan your room QR code with their smartphone camera or enter your 6-character room code in any web browser.',
    },
    {
      q: 'How does the anti-repetition question engine work?',
      a: 'Our game engine uses a Fisher-Yates cryptographically random shuffle coupled with an in-memory session history set. A prompt will never appear twice in the same session until the entire deck is exhausted.',
    },
    {
      q: 'Can I create and play custom Truth or Dare questions with my friends?',
      a: 'Yes! Our Custom Deck Creator allows you to write, save, and play personalized decks stored safely in your browser, or share them directly into multiplayer rooms.',
    },
    {
      q: 'What if someone is uncomfortable with a specific dare?',
      a: 'Player safety and comfort are paramount. Every card includes an unconditional Skip / Veto button that allows any player to pass without penalty or humiliation.',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO SECTION & PRIMARY PLAY BUTTON */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-28 px-4 md:px-8 border-b border-white/10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-300 shadow-glow-brand">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>THE NEXT-GEN ONLINE PARTY GAMING PLATFORM</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.08]">
            Unleash Unfiltered <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-truth-400 via-brand-400 to-dare-400 bg-clip-text text-transparent">
              Party Gaming Nights.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Play <strong>Truth or Dare</strong>, <strong>Spin the Bottle</strong>, and five other social games. Zero app downloads, zero intrusive ads, and real-time multiplayer room synchronization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/games/truth-or-dare" className="w-full sm:w-auto">
              <Button variant="primary" size="xl" className="w-full sm:w-auto text-lg gap-3">
                <Flame className="w-6 h-6 text-dare-300 fill-dare-400" />
                Quick Play (Classic Party)
              </Button>
            </Link>

            <Link href="/games" className="w-full sm:w-auto">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto text-lg gap-2">
                <Compass className="w-5 h-5 text-brand-400" />
                Explore All Games
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-truth-400" /> Sub-2s Instant Launch
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Free & No Ads
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" /> Real-Time Multiplayer Rooms
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: POPULAR CATEGORIES */}
      <section className="py-12 md:py-16 px-4 md:px-8 border-b border-white/5 bg-surface-elevated/40">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Curated Decks</span>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Popular Party Categories</h2>
            </div>
            <p className="text-xs text-slate-400">Tailored questions & dares for every crowd dynamic</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/games/truth-or-dare?category=${cat.id}`}
                className="p-5 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/40 transition-all group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-3xl">{cat.icon}</div>
                  <h3 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>{cat.count}</span>
                  <span className="text-brand-400 group-hover:translate-x-1 transition-transform">Play →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED PARTY GAMES DIRECTORY */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Multi-Game Hub</span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white">
              6 Party Games in One Destination
            </h2>
            <p className="text-sm text-slate-400">
              Never get stuck in a rut. When your party finishes Truth or Dare, switch to Spin the Bottle or Never Have I Ever instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => {
              const Icon = game.icon;
              return (
                <div
                  key={game.slug}
                  className="p-6 rounded-3xl bg-surface-elevated border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                        {game.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-display font-bold text-xl text-white group-hover:text-brand-300 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{game.desc}</p>
                    </div>
                  </div>

                  <Link href={`/games/${game.slug}`}>
                    <Button variant="secondary" size="md" className="w-full justify-between group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <span>Launch Game</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: MULTIPLAYER PROMOTION & ROOM JOIN FORM */}
      <section id="join-room" className="py-16 md:py-24 px-4 md:px-8 border-b border-white/10 bg-gradient-to-b from-surface-elevated/80 to-canvas-base relative overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-400/30 text-xs font-semibold text-brand-300">
              <Users className="w-4 h-4 text-brand-400" />
              <span>SYNCHRONIZED ROOM ENGINE</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl md:text-5xl text-white leading-tight">
              Play Live Over FaceTime, Discord or in Person.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Create a private room in 1 tap. Share your unique 6-character room code or instant QR code. When the active player flips the card, everyone’s screen updates simultaneously in under 150 milliseconds.
            </p>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-truth-400" />
                <span>Instant Camera QR Code Joining (Zero typing required)</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-dare-400" />
                <span>Live floating emoji reactions stream & dare consensus voting</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface-highlight border border-white/10 shadow-elevation-3 space-y-6">
            <h3 className="font-display font-bold text-xl text-white">Join an Active Party</h3>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="room-code" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Enter 6-Digit Room Code:
                </label>
                <input
                  id="room-code"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. PARTY9"
                  value={roomCodeInput}
                  onChange={(e) => {
                    setRoomCodeInput(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  className="w-full h-14 px-4 rounded-xl bg-canvas-base border border-white/15 focus:border-brand-400 focus:outline-none text-center font-mono text-2xl font-bold tracking-widest text-white uppercase placeholder:text-slate-600"
                />
                {joinError && <p className="text-xs text-rose-400 font-medium">{joinError}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full text-base font-bold">
                Join Room Now →
              </Button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-wider">or host</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <Link href="/games/truth-or-dare?createRoom=true">
              <Button variant="secondary" size="md" className="w-full">
                Create a New Room as Host
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW TO PLAY IN 3 STEPS */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Easy Setup</span>
            <h2 className="font-display font-bold text-3xl text-white">How to Play in 3 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/5 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-400 font-display font-extrabold text-xl flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Select Your Vibe</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose between Classic Party, Couples Romance, Teens Hangout, Family Clean, or Spicy 18+.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/5 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-truth-500/20 text-truth-400 font-display font-extrabold text-xl flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-lg text-white">Pass Phone or Share Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pass a single phone around the circle using Pass & Play mode, or share your 6-digit code for synced multi-phone play.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/5 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full bg-dare-500/20 text-dare-400 font-display font-extrabold text-xl flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Flip, Laugh & Play!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flip the 3D card, beat the dare timer, and enjoy unforgettable moments with your favorite people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY CHOOSE ASTERIA */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-b border-white/10 bg-surface-elevated/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">The Premium Difference</span>
            <h2 className="font-display font-bold text-3xl text-white">Why Party Hosts Choose Asteria</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Zero Intrusive Ads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No loud pop-up videos, banner shifts, or screen blocks during live party games.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
              <Zap className="w-6 h-6 text-truth-400" />
              <h3 className="font-bold text-base text-white">Zero Question Repetition</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographic shuffle with session deduplication ensures you never see repeated prompts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
              <Volume2 className="w-6 h-6 text-brand-400" />
              <h3 className="font-bold text-base text-white">Synthesized Web Audio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tactile whooshes, ticking clocks, and chimes generated programmatically with zero lag.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-elevated border border-white/10 space-y-2">
              <Heart className="w-6 h-6 text-dare-400" />
              <h3 className="font-bold text-base text-white">Safe Skipping & Consent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every player has unconditional veto power. Fun is guaranteed without uncomfortable pressure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ ACCORDION */}
      <section className="py-16 md:py-20 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Have Questions?</span>
            <h2 className="font-display font-bold text-3xl text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface-elevated border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-brand-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-brand-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: PROGRAMMATIC SEO CONTENT BLOCK */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-canvas-deep text-slate-400 text-xs leading-relaxed border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-200">
            The Ultimate Guide to Playing Truth or Dare Online
          </h3>
          <p>
            Truth or Dare is universally recognized as the quintessential party game for icebreakers, dorm hangouts, road trips, and intimate date nights. Unlike dated static websites that force users to read through cluttered text lists or endure intrusive video advertisements, Project Asteria modernizes the classic party experience. You can{' '}
            <Link href="/games/truth-or-dare" className="text-brand-300 font-semibold hover:underline">
              play Truth or Dare online
            </Link>{' '}
            with hardware-accelerated 3D card flips, try our interactive{' '}
            <Link href="/games/spin-the-bottle" className="text-brand-300 font-semibold hover:underline">
              spin the bottle wheel
            </Link>
            , or browse the complete{' '}
            <Link href="/games" className="text-brand-300 font-semibold hover:underline">
              online party games directory
            </Link>
            .
          </p>
          <p>
            Whether you are hosting a living room gathering with friends using our Pass & Play turn rotation, hanging out with long-distance best friends on Discord, or enjoying an intimate date night at home, our hand-curated question categories ensure the right energy, intensity, and safety level for your crowd. Learn the standard parliamentary guidelines in our{' '}
            <Link href="/blog/official-truth-or-dare-rules" className="text-brand-300 font-semibold hover:underline">
              official party game rules guide
            </Link>
            , author inside jokes in our{' '}
            <Link href="/custom" className="text-brand-300 font-semibold hover:underline">
              Custom Deck Studio
            </Link>
            , or copy favorite challenges from our library of{' '}
            <Link href="/questions" className="text-brand-300 font-semibold hover:underline">
              500+ Truth or Dare questions
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

