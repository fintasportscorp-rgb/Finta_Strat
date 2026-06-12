import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

type TranslationTree = { [key: string]: string | TranslationTree };

const STORAGE_KEY = 'stratmodel-lang';

export interface Language {
  code: string;
  label: string;
}

/** Drop a new `{code}.json` into public/lang/ and list it here to add a language. */
export const LANGUAGES: Language[] = [{ code: 'en', label: 'English' }];

export type Translate = (keyPath: string, replacements?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: string;
  setLang: (code: string) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const browser = navigator.language.split('-')[0];
  return LANGUAGES.some((l) => l.code === browser) ? browser : 'en';
}

async function fetchTranslations(lang: string): Promise<TranslationTree> {
  const res = await fetch(`/lang/${lang}.json`);
  if (!res.ok) throw new Error(`Translation file for "${lang}" not found`);
  return res.json() as Promise<TranslationTree>;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(getInitialLang);

  const { data: translations } = useSuspenseQuery({
    queryKey: ['translations', lang],
    queryFn: () => fetchTranslations(lang),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const t = useCallback<Translate>(
    (keyPath, replacements = {}) => {
      let value: string | TranslationTree | undefined = translations;
      for (const key of keyPath.split('.')) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return keyPath;
        }
      }
      if (typeof value !== 'string') return keyPath;
      return Object.entries(replacements).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
        value,
      );
    },
    [translations],
  );

  const setLang = useCallback((code: string) => {
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('app.title');
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
