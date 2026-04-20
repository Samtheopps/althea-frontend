'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import t, { type Locale, RTL_LOCALES } from './translations';

const STORAGE_KEY = 'althea_locale';
const DEFAULT_LOCALE: Locale = 'fr';

interface I18nContextValue {
  locale: Locale;
  isRTL: boolean;
  setLocale: (l: Locale) => void;
  /** Typed shorthand — use as: const { tr } = useI18n() */
  tr: typeof t.fr;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in t) setLocaleState(stored);
  }, []);

  const isRTL = RTL_LOCALES.includes(locale);

  // Apply RTL dir + lang to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', locale);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [locale, isRTL]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, isRTL, setLocale, tr: t[locale] as typeof t.fr }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
