'use client';

import { useState } from 'react';
import { Ticket, List, X, User } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { FigmaButton } from '@/components/ui/figma-button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const navigation = [
    { name: t('navigation.events'), href: '#events' },
    { name: t('navigation.categories'), href: '#categories' },
    { name: t('navigation.about'), href: '#about' },
    { name: t('navigation.contact'), href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <Ticket size={24} className="text-blue-600" />
              <span className="text-xl font-bold text-gray-900 font-poppins">
                E-Ticket
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector className="hidden sm:block" />

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  <User size={16} className="mr-1" />
                  {t('navigation.signIn')}
                </Button>
              </Link>
              <FigmaButton
                variant="primary"
                size="md"
                showGlow={true}
              >
                {t('navigation.organizeEvent')}
              </FigmaButton>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-gray-700" />
              ) : (
                <List size={20} className="text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="pt-4 border-t border-white/20 space-y-3">
                <LanguageSelector />
                
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 justify-start w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={16} className="mr-2" />
                      {t('navigation.signIn')}
                    </Button>
                  </Link>
                  <FigmaButton
                    variant="primary"
                    size="md"
                    showGlow={true}
                  >
                    {t('navigation.organizeEvent')}
                  </FigmaButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
