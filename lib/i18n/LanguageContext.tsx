'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_COOKIE_NAME, ALL_LOCALES } from './config';
import { getTranslations, TranslationDictionary } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  dict: TranslationDictionary;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  // Detect locale from pathname (e.g. /es/games -> 'es')
  const pathLocale = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0] as Locale;
    if (firstSegment && ALL_LOCALES.includes(firstSegment)) {
      return firstSegment;
    }
    return undefined;
  }, [pathname]);

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale && ALL_LOCALES.includes(initialLocale)) return initialLocale;
    if (pathLocale) return pathLocale;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCALE_COOKIE_NAME) as Locale;
      if (stored && ALL_LOCALES.includes(stored)) return stored;
    }
    return DEFAULT_LOCALE;
  });

  // Keep state in sync if URL route locale changes
  useEffect(() => {
    if (pathLocale && pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathLocale, locale]);

  // Sync html lang and dir attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const meta = SUPPORTED_LOCALES[locale] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
      document.documentElement.lang = meta.code;
      document.documentElement.dir = meta.dir;
    }
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!ALL_LOCALES.includes(newLocale)) return;
      setLocaleState(newLocale);

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_COOKIE_NAME, newLocale);
        document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        const meta = SUPPORTED_LOCALES[newLocale];
        document.documentElement.lang = meta.code;
        document.documentElement.dir = meta.dir;
      }

      // Re-map the current URL to the new locale
      const segments = pathname.split('/').filter(Boolean);
      const isFirstLocale = segments.length > 0 && ALL_LOCALES.includes(segments[0] as Locale);

      let targetSubpath = isFirstLocale ? '/' + segments.slice(1).join('/') : pathname;
      if (targetSubpath === '') targetSubpath = '/';

      let nextUrl = '';
      if (newLocale === DEFAULT_LOCALE) {
        // Can route to /en or unprefixed path
        nextUrl = `/en${targetSubpath === '/' ? '' : targetSubpath}`;
      } else {
        nextUrl = `/${newLocale}${targetSubpath === '/' ? '' : targetSubpath}`;
      }

      // If user is currently on unprefixed route, we can push the localized URL
      try {
        router.push(nextUrl);
      } catch (err) {
        // Fallback
        window.location.href = nextUrl;
      }
    },
    [pathname, router]
  );

  const dict = useMemo(() => getTranslations(locale), [locale]);
  const dir = SUPPORTED_LOCALES[locale]?.dir || 'ltr';
  const isRTL = dir === 'rtl';

  const t = useCallback(
    (keyPath: string, params?: Record<string, string | number>): string => {
      let val = getNestedValue(dict, keyPath);
      if (val === undefined) {
        // Fallback to English dictionary
        const fallbackDict = getTranslations('en');
        val = getNestedValue(fallbackDict, keyPath);
      }
      if (val === undefined) {
        return keyPath;
      }
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          val = val!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }
      return val;
    },
    [dict]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dict,
      dir,
      isRTL,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    [locale, setLocale, t, dict, dir, isRTL]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    const fallbackDict = getTranslations(DEFAULT_LOCALE);
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string) => getNestedValue(fallbackDict, key) || key,
      dict: fallbackDict,
      dir: 'ltr' as const,
      isRTL: false,
      supportedLocales: SUPPORTED_LOCALES,
    };
  }
  return context;
}
