import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'en' | 'ja' | 'it';

const VALID_LOCALES: Locale[] = ['en', 'ja', 'it'];

/** Returns the persisted locale if pre-seeded by the blocking <head> script,
 *  otherwise falls back to 'ja' (the static-build default). */
function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preSeeded = (window as any).__INITIAL_LOCALE__ as unknown;
      if (typeof preSeeded === 'string' && VALID_LOCALES.includes(preSeeded as Locale)) {
        return preSeeded as Locale;
      }
    } catch {
      // localStorage unavailable (private browsing, SSR mismatch) — use default
    }
  }
  return 'ja';
}

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'language-storage',
    }
  )
);
