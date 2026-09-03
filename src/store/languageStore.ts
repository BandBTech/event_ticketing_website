import { create } from 'zustand';

export type Locale = 'en' | 'ja' | 'it';

const VALID_LOCALES: Locale[] = ['en', 'ja', 'it'];
const APP_LOCALE_STORAGE_KEY = 'timro-ticket-locale';
const LANGUAGE_STORAGE_KEY = 'language-storage';
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && VALID_LOCALES.includes(locale as Locale);
}

function readCookieLocale(): Locale | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${APP_LOCALE_STORAGE_KEY}=`));
  const locale = cookie ? decodeURIComponent(cookie.split('=')[1] || '') : null;

  return isValidLocale(locale) ? locale : null;
}

function readLocalStorageLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  try {
    const locale = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY);

    return isValidLocale(locale) ? locale : null;
  } catch {
    return null;
  }
}

function readLegacyLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const locale = stored ? JSON.parse(stored)?.state?.locale : null;

    return isValidLocale(locale) ? locale : null;
  } catch {
    return null;
  }
}

function getPersistedLocale(): Locale | null {
  return readCookieLocale() || readLocalStorageLocale() || readLegacyLocale();
}

function syncDocumentLocale(locale: Locale) {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__INITIAL_LOCALE__ = locale;
  document.documentElement.lang = locale;
}

export function persistSelectedLocale(locale: Locale) {
  if (typeof window === 'undefined') return;

  try {
    document.cookie = `${APP_LOCALE_STORAGE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale);
    window.localStorage.setItem(
      LANGUAGE_STORAGE_KEY,
      JSON.stringify({
        state: {
          locale,
          hasUserSelectedLocale: true,
        },
        version: 0,
      }),
    );
  } catch {
    // localStorage may be unavailable; keep the in-memory/document locale synced.
  }

  syncDocumentLocale(locale);
}

export function migratePersistedLocale() {
  const locale = getPersistedLocale();
  if (!locale) return null;

  persistSelectedLocale(locale);
  return locale;
}

/** Returns the locale pre-seeded by the blocking <head> script or app storage,
 *  otherwise defaults to English until the user selects another language. */
function getInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preSeeded = (window as any).__INITIAL_LOCALE__ as unknown;
      if (isValidLocale(preSeeded)) {
        return preSeeded;
      }
    } catch {
      // localStorage unavailable; fall through to English default.
    }
  }
  return 'en';
}

interface LanguageStore {
  locale: Locale;
  hasUserSelectedLocale: boolean;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  (set) => ({
    locale: getInitialLocale(),
    hasUserSelectedLocale: getPersistedLocale() !== null,
    setLocale: (locale) => {
      persistSelectedLocale(locale);

      set({ locale, hasUserSelectedLocale: true });
    },
  })
);
