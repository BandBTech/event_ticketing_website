import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ja' | 'it';

const VALID_LOCALES: Locale[] = ['en', 'ja', 'it'];

function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && VALID_LOCALES.includes(locale as Locale);
}

export function getSystemLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const browserLocale = window.navigator.language.toLowerCase();

  if (browserLocale.startsWith('ja')) return 'ja';
  if (browserLocale.startsWith('it')) return 'it';

  return 'en';
}

/** Returns the persisted locale if pre-seeded by the blocking <head> script,
 *  otherwise falls back to the browser/system language. */
function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preSeeded = (window as any).__INITIAL_LOCALE__ as unknown;
      if (isValidLocale(preSeeded)) {
        return preSeeded;
      }
    } catch {
      // localStorage unavailable (private browsing, SSR mismatch) - use system locale
    }
  }
  return getSystemLocale();
}

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      setLocale: (locale) => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__INITIAL_LOCALE__ = locale;
          document.documentElement.lang = locale;
        }

        set({ locale });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
