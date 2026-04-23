'use client';

import en from '../../messages/en.json';
import ja from '../../messages/ja.json';
import it from '../../messages/it.json';

type Locale = 'en' | 'ja' | 'it';

interface TranslationMessages {
  [key: string]: any;
}

const messagesMap: Record<Locale, TranslationMessages> = {
  en,
  ja,
  it,
};

export function useTranslation(locale: Locale = 'ja') {
  const messages = messagesMap[locale] || messagesMap['en'];

  const t = (key: string, fallback?: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        value = fallback || key;
        break;
      }
    }
    
    let result = typeof value === 'string' ? value : fallback || key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return result;
  };

  return { t, isLoading: false, locale };
}

export const locales: Locale[] = ['en', 'ja', 'it'];

export const languageNames: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
  it: 'Italiano',
};