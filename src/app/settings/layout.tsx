'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  IdentificationBadgeIcon, 
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
      icon: IdentificationBadgeIcon,
      description: t('settings.menu.profileDesc', 'Manage your personal information'),
    },
    {
      href: '/settings/security',
      label: t('settings.menu.security', 'Security'),
      icon: LockKeyIcon,
      description: t('settings.menu.securityDesc', 'Password and authentication'),
    },
    {
      href: '/settings/notifications',
      label: t('settings.menu.notifications', 'Notifications'),
      icon: BellIcon,
      description: t('settings.menu.notificationsDesc', 'Email and push notifications'),
    },
    {
      href: '/settings/billing',
      label: t('settings.menu.billing', 'Billing'),
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="rounded-xl sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">
                {t('settings.title', 'Settings')}
              </h2>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        'hover:bg-gray-100',
                        isActive && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <Icon size={20} weight={isActive ? 'fill' : 'duotone'} />
                      <span className="text-base">{item.label}</span>
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
