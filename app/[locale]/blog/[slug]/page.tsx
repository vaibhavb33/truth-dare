import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Clock, Calendar, Play, Sparkles, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ALL_LOCALES, Locale, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/translations';
import { generateLocalizedMetadata } from '@/lib/i18n/seo';
import { ARTICLES } from '@/app/blog/[slug]/page';

interface LocalizedArticleProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = Object.keys(ARTICLES);
  const params: Array<{ locale: string; slug: string }> = [];
  ALL_LOCALES.forEach((locale) => {
    slugs.forEach((slug) => {
      params.push({ locale, slug });
    });
  });
  return params;
}

export async function generateMetadata({ params }: LocalizedArticleProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) return {};
  const article = ARTICLES[slug];
  if (!article) return {};

  const langMeta = SUPPORTED_LOCALES[locale as Locale];

  return generateLocalizedMetadata({
    locale: locale as Locale,
    subpath: `/blog/${slug}`,
    overrideTitle: `${article.metaTitle} — Asteria (${langMeta.nativeName})`,
    overrideDescription: article.metaDescription,
  });
}

export default async function LocalizedArticlePage({ params }: LocalizedArticleProps) {
  const { locale, slug } = await params;
  if (!ALL_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const article = ARTICLES[slug];
  if (!article) {
    notFound();
  }

  const dict = getTranslations(locale as Locale);
  const relatedArticles = article.relatedSlugs
    .map((s) => ARTICLES[s])
    .filter((a): a is typeof article => Boolean(a));

  return (
    <article className="max-w-3xl mx-auto px-4 py-6 md:py-12 space-y-8 flex-1 w-full">
      <Breadcrumbs
        items={[
          { label: dict.breadcrumbs.blog, href: `/${locale}/blog` },
          { label: article.title },
        ]}
      />

      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-[10px]">
            {article.tag}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {article.date}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed font-medium">
          {article.excerpt}
        </p>
      </header>

      {/* Embedded CTA Banner */}
      <div className="p-6 rounded-3xl bg-surface-elevated border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-elevation-1">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
            {dict.home.heroBadge}
          </span>
          <h3 className="font-display font-bold text-lg text-white">
            {article.ctaGameTitle}
          </h3>
          <p className="text-xs text-slate-400">{article.ctaGameDesc}</p>
        </div>

        <Link href={`/${locale}${article.ctaGameHref}`}>
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
            <BookOpen className="w-4 h-4 text-brand-400" /> {dict.blog.featuredGuides}
          </h3>
          <Link href={`/${locale}/blog`} className="text-xs font-semibold text-brand-400 hover:text-white">
            {dict.blog.allArticles} →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.slug}
              href={`/${locale}/blog/${rel.slug}`}
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
                <span>{dict.blog.readMore}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Internal Navigation Links */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <Link href={`/${locale}/questions`} className="hover:text-brand-300 transition-colors flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-brand-400" /> {dict.nav.questionLibrary}
        </Link>
        <Link href={`/${locale}/games`} className="hover:text-brand-300 transition-colors flex items-center gap-1">
          <Users className="w-4 h-4 text-truth-400" /> {dict.nav.allGames}
        </Link>
      </div>
    </article>
  );
}
