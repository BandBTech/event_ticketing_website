// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { TicketIcon, CalendarDotsIcon, MapPinIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';
// import { Button } from '@/components/ui/button';
// import { FigmaButton } from '@/components/ui/figma-button';
// import { EventSearch } from '@/components/events/EventSearch';
// import { EventGrid } from '@/components/events/EventGrid';
// import { Badge } from '@/components/ui/badge';
// import { useEvents, useFeaturedEvents, useEventCategories } from '@/hooks/useEvents';
// import { useLanguageStore } from '@/store/languageStore';
// import { useTranslation } from '@/hooks/useTranslation';
// import { cn } from '@/lib/utils';

// export default function HomePage() {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const { locale } = useLanguageStore();
//   const { t } = useTranslation(locale);

//   const { data: eventsData, isLoading: eventsLoading } = useEvents({
//     search: searchQuery,
//     limit: 6,
//   });

//   const { data: featuredEvents } = useFeaturedEvents({
//     limit: 6,
//   });

//   const { data: categories } = useEventCategories({
//     limit: 20,
//   });

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//   };

//   const handleCategorySelect = (category: string) => {
//     setSelectedCategory(category);
//   };

//   return (
//     <div className="min-h-screen">

//       {/* Hero Section */}
//       <section className="relative py-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center space-y-8">
//             {/* Hero Content */}
//             <div className="space-y-6">
//               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border">
//                 <TicketIcon size={20} className="text-blue-600" />
//                 <span className="text-sm font-medium text-gray-700">
//                   {t('hero.badge')}
//                 </span>
//               </div>

//               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 font-poppins">
//                 {t('hero.title').split(' ').slice(0, 2).join(' ')}{' '}
//                 <span className="gradient-text">{t('hero.title').split(' ')[2]}</span>
//                 <br />
//                 {t('hero.title').split(' ').slice(3).join(' ')}
//               </h1>

//               <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//                 {t('hero.subtitle')}
//               </p>
//             </div>

//             {/* Search Section */}
//             <div className="max-w-2xl mx-auto">
//               <EventSearch
//                 onSearch={handleSearch}
//                 placeholder={t('hero.searchPlaceholder')}
//                 className="w-full"
//               />
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
//               <div className="glass rounded-lg p-6 text-center">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
//                 <div className="text-gray-600 text-sm">{t('hero.stats.events')}</div>
//               </div>
//               <div className="glass rounded-lg p-6 text-center">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
//                 <div className="text-gray-600 text-sm">{t('hero.stats.tickets')}</div>
//               </div>
//               <div className="glass rounded-lg p-6 text-center">
//                 <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
//                 <div className="text-gray-600 text-sm">{t('hero.stats.cities')}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { HomeEvent } from "@/components/events/HomeEvent";
import { HeroEventsBanner } from "@/components/events/HeroEventsBanner";
import { FigmaButton } from "@/components/ui/figma-button";
import {
  useEvents,
  useFeaturedEvents,
  useOnSaleEvents,
  useSalesUpcomingEvents,
  useScheduledEvents,
} from "@/hooks/useEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Event } from "@/types/event";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Banner query
  const { data: salesLiveData, isLoading: salesLoading } = useEvents({
    limit: 10,
    status: "on_sale",
  });
  const { data: featuredEvents } = useFeaturedEvents();
  const { data: allEventsData } = useEvents({
    limit: 10,
  });

  const salesLiveEvents = (salesLiveData?.events || []).filter(
    (event) => event.status === "on_sale",
  );

  // Categorized sections queries
  const { data: onSaleData, isLoading: onSaleLoading } = useOnSaleEvents(6);
  const { data: salesUpcomingData, isLoading: salesUpcomingLoading } = useSalesUpcomingEvents(6);
  const { data: scheduledData, isLoading: scheduledLoading } = useScheduledEvents(6);

  // Sort helper: featured events first (ASC by title), then regular events (ASC by title)
  const sortEvents = (events: Event[] = []) => {
    const featured = events.filter((e) => e.is_featured);
    const regular = events.filter((e) => !e.is_featured);
    const compareTitle = (a: Event, b: Event) =>
      a.title.localeCompare(b.title, "en", { sensitivity: "base" });
    featured.sort(compareTitle);
    regular.sort(compareTitle);
    return [...featured, ...regular];
  };

  const onSaleEvents = sortEvents(onSaleData?.events || []);
  const salesUpcomingEvents = sortEvents(salesUpcomingData?.events || []);
  const scheduledEvents = sortEvents(scheduledData?.events || []);

  const handleOrganizeRedirect = () => {
    window.open("https://sandbox-organizer.timroticket.com/login/", "_blank");
  };

  const isSectionsLoading = onSaleLoading || salesUpcomingLoading || scheduledLoading;

  return (
    <div className="min-h-screen">
      {/* Hero Banner with Latest & Featured Events */}
      <HeroEventsBanner
        featuredEvents={featuredEvents}
        salesLiveEvents={salesLiveEvents}
        allEvents={allEventsData?.events || []}
        isLoading={salesLoading}
      />

      {isSectionsLoading ? (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {[...Array(2)].map((_, sectionIdx) => (
              <div key={sectionIdx} className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, cardIdx) => (
                    <div key={cardIdx} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* 1. On Sale - Always show first. Hide if empty. */}
          {onSaleEvents.length > 0 && (
            <section id="on-sale" className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                    {t("sections.onSale.title", "On Sale Now")}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {t("sections.onSale.subtitle", "These are the events you can purchase immediately.")}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {onSaleEvents.map((event) => (
                    <HomeEvent key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 2. Upcoming Sales - Show second. Hide if empty. */}
          {salesUpcomingEvents.length > 0 && (
            <section id="upcoming-sales" className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                    {t("sections.salesUpcoming.title", "Upcoming Sales")}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {t("sections.salesUpcoming.subtitle", "Discover events and plan ahead.")}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {salesUpcomingEvents.map((event) => (
                    <HomeEvent key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 3. Scheduled Events - Show last. Hide if empty. */}
          {scheduledEvents.length > 0 && (
            <section id="scheduled-events" className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-left mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                    {t("sections.scheduledEvents.title", "Scheduled Events")}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {t("sections.scheduledEvents.subtitle", "Approved and announced, tickets not available yet.")}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledEvents.map((event) => (
                    <HomeEvent key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4. View All Events Link */}
          <div className="text-center py-12">
            <Link href="/allevents">
              <FigmaButton variant="primary" size="lg" showGlow={true}>
                {t("sections.viewAllEvents", "View All Events")} <span className="ml-1">→</span>
              </FigmaButton>
            </Link>
          </div>
        </>
      )}

      {/* CTA Section */}
      {!isAuthenticated && !user && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-strong rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                {t("sections.cta.title")}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {t("sections.cta.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FigmaButton
                  variant="primary"
                  size="xl"
                  showGlow={true}
                  onClick={handleOrganizeRedirect}
                >
                  <UsersIcon weight="duotone" size={20} />
                  {t("sections.cta.organizeEvent")}
                </FigmaButton>
                <Link href="/about">
                  <FigmaButton variant="glass" size="xl">
                    {t("sections.cta.learnMore")}
                  </FigmaButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
