'use client';

import { useState } from 'react';
import { Globe, CaretDown } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/store/languageStore';
import { cn } from '@/lib/utils';

interface Language {
  code: 'en' | 'ja' | 'it';
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useLanguageStore();

  const activeLocale = locale;
  const currentLang = languages.find(lang => lang.code === activeLocale) || languages[0];

  const handleLanguageSelect = (langCode: 'en' | 'ja' | 'it') => {
    setLocale(langCode);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full glass border",
          "text-gray-700 hover:bg-white/90 transition-all duration-200"
        )}
      >
        <Globe size={16} className="text-gray-600" />
        <span className="text-sm font-medium" suppressHydrationWarning={true} >{currentLang.name}</span>
        <CaretDown 
          size={12} 
          className={cn(
            "text-gray-600 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 right-0 z-50 min-w-[160px]  rounded-lg shadow-xl overflow-hidden bg-white border border-gray-200">
            <div className="py-1"> 
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer",
                  "hover:bg-gray-50 transition-colors duration-200",
                  "text-sm font-medium text-gray-700",
                  activeLocale === language.code && "bg-blue-50/80 text-blue-700"
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {activeLocale === language.code && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
          </div>
          
        </>
      )}
    </div>
  );
}
