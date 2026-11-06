import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar, Flame, Play, Sparkles, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

interface ArticleData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  readTime: string;
  date: string;
  datePublished: string;
  dateModified: string;
  tag: string;
  ctaGameTitle: string;
  ctaGameDesc: string;
  ctaGameHref: string;
  ctaButtonText: string;
  sections: Array<{
    heading?: string;
    paragraphs?: React.ReactNode[];
    listType?: 'ol' | 'ul';
    listItems?: React.ReactNode[];
  }>;
  schemaType: string;
  relatedSlugs: string[];
}

const ARTICLES: Record<string, ArticleData> = {
  'official-truth-or-dare-rules': {
    slug: 'official-truth-or-dare-rules',
    title: 'The Official Rules of Truth or Dare: How to Play & House Variations',
    metaTitle: 'Official Truth or Dare Rules: How to Play, Variations & Safety',
    metaDescription:
      'Learn the official rules of Truth or Dare. Master classic turn rotations, safe veto rules, scoring systems, and modern video call adaptations.',
    excerpt:
      'Learn standard turns, pass limits, drinking penalties, and how to keep party games exciting without awkward boundaries.',
    readTime: '4 min read',
    date: 'November 2026',
    datePublished: '2026-11-01T00:00:00Z',
    dateModified: '2026-11-05T00:00:00Z',
    tag: 'Rules & Guides',
    ctaGameTitle: 'Play Truth or Dare Right in Your Browser',
    ctaGameDesc: 'No app download required. Instant 3D card flips with countdown timer and audio.',
    ctaGameHref: '/games/truth-or-dare',
    ctaButtonText: 'Play Truth or Dare Online',
    schemaType: 'HowTo',
    relatedSlugs: ['50-best-dares-over-facetime', 'clean-icebreakers-for-work'],
    sections: [
      {
        paragraphs: [
          'Truth or Dare is one of the most enduring social party games in the world. Whether played in college dorms, living room circles, or over video calls with long-distance partners, the core thrill lies in uncovering secrets and conquering silly, daring challenges.',
          'To keep the gameplay fast-paced, balanced, and fun for everyone, adhering to standard parliamentary rules ensures nobody feels pressured or left out.',
        ],
      },
      {
        heading: 'Core Official Rules',
        listType: 'ol',
        listItems: [
          'The Choice: When it is your turn, you must declare "Truth" or "Dare" before seeing the prompt.',
          'The Truth Rule: Once chosen, you must answer honestly without evading the core question.',
          'The Dare Rule: You must attempt to perform the challenge within the designated time limit (typically 30–60 seconds).',
          'The Safe Skip / Veto: Personal safety, legal boundaries, and emotional comfort always take priority. Any player may veto a prompt without penalty.',
        ],
      },
      {
        heading: 'Popular House Variations',
        listType: 'ul',
        listItems: [
          'No Repeats: A player cannot select "Truth" or "Dare" more than twice consecutively.',
          'Drink Forfeit: If playing adult drinking rules, skipping a prompt requires taking 2 sips of your beverage.',
          'Consensus Voting: The room takes a vote ("Passed" or "Chickened Out") to decide if a physical dare was successfully completed.',
          'Double Dare: When dared, a player can bounce the dare to another player, who must perform it or double the forfeit.',
        ],
      },
      {
        heading: 'Virtual & Video Call Adaptations',
        paragraphs: [
          'Playing over FaceTime, Google Meet, or Discord? Truth or Dare works seamlessly across video screens. Use screenshot proofs, camera angle challenges, or rapid message replies to verify dares digitally.',
          'Looking for video-specific challenges? Browse our curated guide to 50 Best Dares to Do Over FaceTime, or jump straight into the Couples & Flirty game deck in your browser.',
        ],
      },
    ],
  },
  '50-best-dares-over-facetime': {
    slug: '50-best-dares-over-facetime',
    title: '50 Best Dares to Do Over FaceTime, Zoom & Text',
    metaTitle: '50 Best Dares to Do Over FaceTime, Zoom & Video Calls',
    metaDescription:
      'Looking for crazy dares you can do over a video call? Here are 50 creative dares for FaceTime, Zoom, and group chats with friends or partners.',
    excerpt:
      'Keep the romantic spark and laughter alive across different time zones with camera-friendly dare challenges.',
    readTime: '6 min read',
    date: 'November 2026',
    datePublished: '2026-11-02T00:00:00Z',
    dateModified: '2026-11-05T00:00:00Z',
    tag: 'Couples & Romance',
    ctaGameTitle: 'Play Couples Truth or Dare Online',
    ctaGameDesc: 'Launch our Couples & Flirty deck directly in your browser with synchronized countdown timer.',
    ctaGameHref: '/games/truth-or-dare?category=couples-flirty',
    ctaButtonText: 'Play Couples Truth or Dare',
    schemaType: 'ItemList',
    relatedSlugs: ['official-truth-or-dare-rules', 'clean-icebreakers-for-work'],
    sections: [
      {
        paragraphs: [
          'Long-distance relationships and late-night FaceTime sessions need unexpected spark and laughter. Standard living-room dares often fall flat when you are miles apart, but video-optimized dares make virtual hangout sessions just as intimate and hilarious as being in the same room.',
          'Before beginning, make sure both partners agree on basic Official Truth or Dare Rules and safe veto limits.',
        ],
      },
      {
        heading: 'Camera & Performance Dares',
        listType: 'ol',
        listItems: [
          'Put on your most serious news anchor voice and narrate everything the other person is wearing for 60 seconds.',
          'Hold your phone above your head and do your best runway fashion model walk across your bedroom.',
          'Eat a spoonful of hot sauce or raw condiment on camera without making a single facial expression.',
          'Give a dramatic 60-second TED Talk presentation about why pineapple on pizza is a culinary masterpiece.',
          'Imitate the other person’s exact posture and vocal mannerisms for the next 3 turns.',
        ],
      },
      {
        heading: 'Digital & Smartphone Dares',
        listType: 'ol',
        listItems: [
          'Screenshot your 3 most recent camera roll photos and send them into the chat with zero context.',
          'Share your screen and let the other person dictate a completely random text message to your fifth recent contact.',
          'Change your video call background or profile avatar to the funniest photo of yourself for 24 hours.',
          'Show your daily screen time breakdown on camera without closing any application windows.',
          'Send a voice note singing your favorite guilty pleasure chorus at full volume.',
        ],
      },
      {
        heading: 'Virtual Safety & Boundary Rules',
        paragraphs: [
          'Remember: virtual dares should always be respectful, consent-based, and mutually hilarious. Never pressure anyone into dangerous activities or uncomfortable disclosures.',
          'Looking for more inspiration? Explore over 500+ Truth or Dare questions in our searchable prompt vault.',
        ],
      },
    ],
  },
  'clean-icebreakers-for-work': {
    slug: 'clean-icebreakers-for-work',
    title: 'Clean Icebreakers & Safe Party Games for Remote Teams',
    metaTitle: 'Clean Icebreakers & Fun Party Games for Remote Work Teams',
    metaDescription:
      'Engage your remote team without the awkwardness! Discover clean, HR-safe icebreakers and parlor games perfect for Slack, Zoom, and offsites.',
    excerpt:
      'Ditch the awkward silence on Zoom calls with engaging, school and workplace safe conversation starters.',
    readTime: '5 min read',
    date: 'November 2026',
    datePublished: '2026-11-03T00:00:00Z',
    dateModified: '2026-11-05T00:00:00Z',
    tag: 'Team Building',
    ctaGameTitle: 'Play Rapid This or That Icebreaker',
    ctaGameDesc: '60-second workplace-safe preference duels to get your colleagues laughing before team standups.',
    ctaGameHref: '/games/this-or-that',
    ctaButtonText: 'Play This or That Gauntlet',
    schemaType: 'ItemList',
    relatedSlugs: ['official-truth-or-dare-rules', '50-best-dares-over-facetime'],
    sections: [
      {
        paragraphs: [
          'Virtual team meetings can often feel rigid, quiet, and transactional. Starting meetings with safe, energetic icebreakers dissolves tension and helps distributed colleagues bond across departments.',
          'Below is a curated collection of HR-friendly, inclusive icebreakers and question formats designed to spark friendly debate without touching sensitive personal topics.',
        ],
      },
      {
        heading: 'Quick-Fire Preference Starters (5 Minutes)',
        listType: 'ul',
        listItems: [
          'Morning person or night owl: which hours produce your absolute best creative flow?',
          'Physical office desk setup: minimalist clean or surrounded by notebooks and snacks?',
          'Audio during deep work: complete silence, white noise, or upbeat electronic beats?',
          'Instant messaging style: crisp bullet points or enthusiastic emoji reactions?',
        ],
      },
      {
        heading: 'Team Retrospective Icebreakers',
        listType: 'ol',
        listItems: [
          'What was the most unexpected productivity discovery or shortcut you learned this month?',
          'If our project milestone had a movie soundtrack, what genre would it be?',
          'Give a quick shout-out to a colleague whose help made your week noticeably smoother.',
          'What is one non-work hobby or curiosity you’ve spent time exploring lately?',
        ],
      },
      {
        heading: 'Best Practices for Remote Game Hosts',
        paragraphs: [
          'Always keep icebreaker rounds brief (under 10 minutes), keep participation strictly voluntary, and celebrate diverse viewpoints. Using web-based tools like Asteria allows distributed teams to join without installing software or registering accounts.',
          'For corporate group fun, try running Never Have I Ever Online in wholesome mode or launch a rapid This or That preference session.',
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = ARTICLES[resolvedParams.slug];

  if (!article) {
    return {
      title: 'Guide Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';
  const canonicalUrl = `${siteUrl}/blog/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: article.metaTitle,
      description: article.metaDescription,
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: ['Asteria Game Studio'],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const article = ARTICLES[resolvedParams.slug];

  if (!article) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truthordarequiz.com';
  const articleUrl = `${siteUrl}/blog/${article.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'Asteria Game Studio',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Asteria Party Gaming',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  const relatedArticles = article.relatedSlugs
    .map((slug) => ARTICLES[slug])
    .filter(Boolean);

  return (
    <article className="max-w-4xl mx-auto px-4 py-6 md:py-12 space-y-8 w-full flex-1">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: 'Party Game Guides', href: '/blog' },
          { label: article.title },
        ]}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Guides Hub
      </Link>

      <div className="space-y-4 border-b border-white/10 pb-8">
        <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-xs">
          {article.tag}
        </span>

        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
          <span>•</span>
          <span>By Asteria Game Studio</span>
        </div>
      </div>

      {/* Embedded Playable Widget */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-surface-elevated to-surface-highlight border border-brand-500/30 shadow-glow-brand flex flex-col sm:flex-row items-center justify-between gap-6 my-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-dare-400">
            <Flame className="w-4 h-4" /> Ready to Play?
          </div>
          <h3 className="font-display font-bold text-xl text-white">
            {article.ctaGameTitle}
          </h3>
          <p className="text-xs text-slate-400">{article.ctaGameDesc}</p>
        </div>

        <Link href={article.ctaGameHref}>
          <Button variant="primary" size="lg" className="gap-2 shrink-0 font-bold">
            <Play className="w-4 h-4 fill-white" /> {article.ctaButtonText}
          </Button>
        </Link>
      </div>

      {/* Article Content */}
      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm md:text-base leading-relaxed">
        {article.sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            {section.heading && (
              <h2 className="font-display font-bold text-2xl text-white pt-4">
                {section.heading}
              </h2>
            )}
            {section.paragraphs &&
              section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            {section.listType === 'ol' && section.listItems && (
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300">
                {section.listItems.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ol>
            )}
            {section.listType === 'ul' && section.listItems && (
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
                {section.listItems.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Related Guides Section */}
      <section className="pt-10 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" /> Related Party Game Guides
          </h3>
          <Link href="/blog" className="text-xs font-semibold text-brand-400 hover:text-white">
            View All Guides →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.slug}
              href={`/blog/${rel.slug}`}
              className="p-5 rounded-2xl bg-surface-elevated hover:bg-surface-highlight border border-white/10 hover:border-brand-500/30 transition-all space-y-2 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                {rel.tag}
              </span>
              <h4 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                {rel.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">{rel.excerpt}</p>
              <div className="text-xs text-brand-400 font-semibold flex items-center gap-1 pt-1">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Internal Navigation Links */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <Link href="/questions" className="hover:text-brand-300 transition-colors flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-brand-400" /> Explore 500+ Truth or Dare Questions
        </Link>
        <Link href="/games" className="hover:text-brand-300 transition-colors flex items-center gap-1">
          <Users className="w-4 h-4 text-truth-400" /> View All Party Games
        </Link>
      </div>
    </article>
  );
}
