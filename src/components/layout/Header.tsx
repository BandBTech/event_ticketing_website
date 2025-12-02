'use client';

import { useState } from 'react';
import { TicketIcon, List, X, User, SignOut, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { FigmaButton } from '@/components/ui/figma-button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguageStore } from '@/store/languageStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    // [TODO: Translate Setup]
    toast.success(
      "", result?.message || 'Logout Successful'
    );
    router.push('/');
  };

  const navigation = [
    { name: t('navigation.events'), href: '/allevents' },
    { name: t('navigation.categories'), href: '#categories' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2 py-1.5 cursor-pointer hover:opacity-80 transition-opacity">
              <TicketIcon weight='fill' size={24} className="text-blue-600" />
              <span className="text-xl font-bold text-gray-900 font-poppins">
                Timro-Ticket
              </span>
            </div>
          </Link>

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
              {isAuthenticated && user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3 py-1.5 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <User size={20} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-strong border border-white/50 shadow-xl">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/settings/profile" className="cursor-pointer flex items-center">
                          <UserCircle size={16} className="mr-2" />
                          {t('navigation.profile', 'My Profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/tickets" className="cursor-pointer flex items-center">
                          <TicketIcon size={16} className="mr-2" />
                          {t('navigation.myTickets', 'My Tickets')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/billing" className="cursor-pointer flex items-center">
                          <User size={16} className="mr-2" />
                          {t('navigation.billing', 'Billing')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings/notifications" className="cursor-pointer flex items-center">
                          <User size={16} className="mr-2" />
                          {t('navigation.notifications', 'Notifications')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-red-50"
                      >
                        <SignOut size={16} className="mr-2" />
                        {t('navigation.logout', 'Logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
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
                </>
              )}
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
                  {isAuthenticated && user ? (
                    <>
                      <Link href="/settings/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                          <User size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-gray-700 hover:text-destructive hover:bg-red-50 justify-start w-full"
                      >
                        <SignOut size={16} className="mr-2" />
                        {t('navigation.logout', 'Logout')}
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
