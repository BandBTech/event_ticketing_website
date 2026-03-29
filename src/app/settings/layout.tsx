'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  UserIcon, 
  LockKeyIcon, 
  BellIcon, 
  CreditCardIcon, 
  TicketIcon
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const menuItems = [
    {
      href: '/settings/profile',
      label: t('settings.menu.profile', 'Profile'),
      icon: UserIcon,
      description: t('settings.menu.profileDesc', 'Manage your personal information'),
    },
    {
      href: '/settings/security',
      label: t('settings.menu.security', 'Security'),
      icon: LockKeyIcon,
      description: t('settings.menu.securityDesc', 'Password and authentication'),
    },
    // {
    //   href: '/settings/notifications',
    //   label: t('settings.menu.notifications', 'Notifications'),
    //   icon: BellIcon,
    //   description: t('settings.menu.notificationsDesc', 'Email and push notifications'),
    // },
    {
      href: '/settings/transactions',
      label: t('settings.menu.transactions', 'Billing'),
      icon: CreditCardIcon,
      description: t('settings.menu.billingDesc', 'Manage your payment methods'),
    },
    {
      href: '/settings/tickets',
      label: t('settings.menu.tickets', 'My Tickets'),
      icon: TicketIcon,
      description: t('settings.menu.ticketsDesc', 'View your event tickets'),
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-row lg:flex-row">
          {/* Sidebar Navigation */}
         <aside className={cn(
    "flex-shrink-0 border-r border-gray-100 transition-all duration-300 ",
    " lg:w-64", 
    "sticky top-0 h-screen lg:top-24 lg:h-auto" 
  )}>
    <div className="flex flex-col h-full ">
      <h2 className="text-lg font-semibold text-gray-900 mb-2 px-2 hidden lg:block">
        {t('settings.title', 'Settings')}
      </h2>
      

      <nav className="flex flex-col gap-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-2 py-2 rounded-lg transition-all whitespace-nowrap',
                'hover:bg-gray-100 shrink-0',
                isActive 
                  ? 'bg-primary/10 text-primary font-bold md:font-medium border-b-2 border-primary md:border-b-0' 
                  : 'text-gray-500 hover:text-gray-900'
              )}
              title={item.label}
            >
              <div className="flex-shrink-0">
                <Icon size={24} weight={isActive ? 'fill' : 'duotone'} />
              </div>

          <div className="hidden lg:block overflow-hidden">
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive ? "font-bold" : ""
                )}>
                  {item.label}
                </span>
                <p className="text-[10px] text-gray-400 line-clamp-1">
                  {item.description}
                </p>
              </div>
              
            </Link>
          );
        })}
      </nav>
    </div>
  </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
