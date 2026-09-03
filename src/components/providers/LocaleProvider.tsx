'use client';

import { ReactNode, useEffect, useState } from 'react';
import {
  Locale,
  migratePersistedLocale,
  useLanguageStore,
} from '@/store/languageStore';

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale: Locale;
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const persistedLocale = migratePersistedLocale();
    const locale = persistedLocale || initialLocale;

    useLanguageStore.setState({
      locale,
      hasUserSelectedLocale: persistedLocale !== null,
    });
    setIsReady(true);
  }, [initialLocale]);

  if (!isReady) return null;

  return children;
}
