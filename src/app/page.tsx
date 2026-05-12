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

//       {/* Featured Events Section */}
//       {featuredEvents && featuredEvents.length > 0 && (
//         <section className="py-16 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
//                 {t('sections.featuredEvents.title')}
//               </h2>
//               <p className="text-gray-600 text-lg">
//                 {t('sections.featuredEvents.subtitle')}
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {featuredEvents.slice(0, 3).map((event) => (
//                 <div
//                   key={event.id}
//                   className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300"
//                 >
//                   <div className="aspect-video relative overflow-hidden">
//                     <Image
//                       src={event.imageUrl}
//                       alt={event.title}
//                       width={400}
//                       height={225}
//                       className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
//                     <div className="absolute bottom-4 left-4 right-4">
//                       <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
//                         {event.title}
//                       </h3>
//                       <div className="flex items-center gap-4 text-sm text-slate-300">
//                         <div className="flex items-center gap-1">
//                           <CalendarDotsIcon weight="duotone" size={16} />
//                           <span>Aug 12</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <MapPinIcon weight="duotone" size={16} />
//                           <span>{event.venue.city}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Categories Section */}
//       {categories && categories.length > 0 && (
//         <section className="py-8 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex flex-wrap justify-center gap-3">
//               {categories.map((category) => (
//                 <Badge
//                   key={category.id}
//                   variant="outline"
//                   className={cn(
//                     "px-4 py-2 cursor-pointer transition-all duration-300",
//                     "glass border text-gray-700 hover:bg-white/90",
//                     selectedCategory === category.name && "bg-primary/20 border-blue-400/50 text-primary"
//                   )}
//                   onClick={() => handleCategorySelect(category.name)}
//                 >
//                   {category.name}
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Events Grid Section */}
//       <section className="py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
//                 {searchQuery || selectedCategory ? t('sections.upcomingEvents.searchResults') : t('sections.upcomingEvents.title')}
//               </h2>
//               <p className="text-gray-600">
//                 {eventsData?.pagination.total || 0} {t('sections.upcomingEvents.eventsFound')}
//               </p>
//             </div>

//             {(searchQuery || selectedCategory) && (
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setSearchQuery('');
//                   setSelectedCategory('');
//                 }}
//                 className="glass border text-gray-700 hover:bg-white/90"
//               >
//                 {t('sections.upcomingEvents.clearFilters')}
//               </Button>
//             )}
//           </div>

//           <EventGrid
//             events={eventsData?.events || []}
//             isLoading={eventsLoading}
//           />

//           {/* Load More Button */}
//           {eventsData && eventsData.pagination.page < eventsData.pagination.totalPages && (
//             <div className="text-center mt-12">
//               <FigmaButton
//                 variant="primary"
//                 size="lg"
//                 showGlow={true}
//               >
//                 {t('common.loadMore')}
//               </FigmaButton>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto text-center">
//           <div className="glass-strong rounded-2xl p-12">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
//               {t('sections.cta.title')}
//             </h2>
//             <p className="text-gray-600 text-lg mb-8">
//               {t('sections.cta.subtitle')}
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <FigmaButton
//                 variant="primary"
//                 size="xl"
//                 showGlow={true}
//               >
//                 <UsersIcon weight="duotone" size={20} />
//                 {t('sections.cta.organizeEvent')}
//               </FigmaButton>
//               <FigmaButton
//                 variant="glass"
//                 size="xl"
//               >
//                 {t('sections.cta.learnMore')}
//               </FigmaButton>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

"use client";

import { EventSearch } from "@/components/events/EventSearch";
import { HomeEvent } from "@/components/events/HomeEvent";
import { Button } from "@/components/ui/button";
import { FigmaButton } from "@/components/ui/figma-button";
import {
  useEvents,
  useFeaturedEvents,
  useUpcomingEvents,
} from "@/hooks/useEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { TicketIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user, isAuthenticated } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: eventsData, isLoading: eventsLoading } = useEvents(
    {
      search: searchQuery,
      category: selectedCategory,
      limit: 6,
    },
    { enabled: !!(searchQuery || selectedCategory) },
  );
  const { data: salesLiveData, isLoading: salesLoading } = useEvents({
    limit: 6,
    status: "on_sale",
  });

  const { data: featuredEvents } = useFeaturedEvents();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useUpcomingEvents(3);

  const upcomingEvents = data?.pages.flatMap((page) => page.events) || [];
  const salesLiveEvents = salesLiveData?.events || [];
  const totalItems = data?.pages[0]?.pagination.total;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchInput(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };
  const handleOrganizeRedirect = () => {
    window.open("https://sandbox-organizer.timroticket.com/login/", "_blank");
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleClearAll = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border">
                <TicketIcon size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t("hero.badge")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 font-poppins">
                {t("hero.title").split(" ").slice(0, 2).join(" ")}{" "}
                <span className="gradient-text">
                  {t("hero.title").split(" ")[2]}
                </span>
                <br />
                {t("hero.title").split(" ").slice(3).join(" ")}
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <EventSearch
                onSearch={handleSearch}
                value={searchInput}
                placeholder={t("hero.searchPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Only show when searching or filtering */}
            {(searchQuery || selectedCategory) && (
              <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col sm:flex-row items-baseline gap-4">
                      <h1 className="text-3xl font-bold text-gray-900 text-left">
                        {t("sections.upcomingEvents.searchResults")}{" "}
                      </h1>
                      <span className="text-sm">
                        {eventsData?.pagination.total || 0}{" "}
                        {t("sections.upcomingEvents.eventsFound")}
                      </span>
                    </div>

                    {(searchQuery || selectedCategory) && (
                      <Button
                        variant="outline"
                        onClick={handleClearAll}
                        className="glass border text-gray-700 hover:bg-white/90"
                      >
                        {t("sections.upcomingEvents.clearSearch")}
                      </Button>
                    )}
                  </div>

                  {/* <EventGrid
                    events={eventsData?.events || []}
                    isLoading={eventsLoading}
                  /> */}
                  {eventsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : eventsData?.events && eventsData?.events?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {eventsData?.events?.map((event) => (
                        <HomeEvent key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No events found</p>
                    </div>
                  )}

                  {/* Load More Button */}
                  {eventsData &&
                    eventsData.pagination.page <
                      eventsData.pagination.totalPages && (
                      <div className="text-center mt-12">
                        <FigmaButton
                          variant="primary"
                          size="lg"
                          showGlow={true}
                        >
                          {t("common.loadMore")}
                        </FigmaButton>
                      </div>
                    )}
                </div>
              </section>
            )}
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  500+
                </div>
                <div className="text-gray-600 text-sm">
                  {t("hero.stats.events")}
                </div>
              </div>
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  50K+
                </div>
                <div className="text-gray-600 text-sm">
                  {t("hero.stats.tickets")}
                </div>
              </div>
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
                <div className="text-gray-600 text-sm">
                  {t("hero.stats.cities")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SALES LIVE */}
      {salesLiveEvents && salesLiveEvents.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                  {t("sections.salesLive.title")}
                </h2>
                <p className="text-gray-500">
                  {t("sections.salesLive.subtitle")}
                </p>
              </div>
              {/* <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">Live Now</Badge> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salesLoading ? (
                <p>{t("sections.salesLive.loading")}</p>
              ) : salesLiveEvents.length > 0 ? (
                salesLiveEvents.map((event) => (
                  <HomeEvent key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center bg-gray-50 rounded-xl border-2 border-dashed">
                  <p className="text-gray-400">
                    {t("sections.salesLive.noEvents")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Events Section */}
      {/* {featuredEvents && featuredEvents.length > 0 && (
        <section id="events" className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-left mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                {t("sections.featuredEvents.title")}
              </h2>
              <p className="text-gray-600 text-lg">
                {t("sections.featuredEvents.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <HomeEvent key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )} */}

      {upcomingEvents && upcomingEvents.length > 0 && (
        <section id="upcoming-events" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header aligned to center to match Featured section */}
            <div className="text-left mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                {t("sections.upcomingEvents.title")}
              </h2>
              <p className="text-gray-600 text-lg">
                {t("common.pagination.showing")} {upcomingEvents.length}{" "}
                {t("common.pagination.of")} {totalItems}{" "}
                {t("sections.upcomingEvents.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <HomeEvent key={event.id} event={event} />
              ))}
            </div>

            {/* View All Link */}
            {hasNextPage && (
              <div className="text-center mt-12">
                <FigmaButton
                  variant="primary"
                  size="lg"
                  showGlow={true}
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    t("upcomming.loadMore")
                  )}
                </FigmaButton>
              </div>
            )}
          </div>
        </section>
      )}

      {/* {upcomingEvents && upcomingEventsArray.length > 0 && (
        <section id="upcoming-events" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-left mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                {t("sections.upcomingEvents.title")}
              </h2>
              <p className="text-gray-600 text-lg">
                {upcomingPagination?.total || upcomingEventsArray.length}{" "}
                {t("sections.upcomingEvents.subtitle")}
              </p>
            </div>
            <EventGrid
              events={upcomingEventsArray.slice(0, 3)} // Limit to 3 events
              isLoading={upcomingLoading}
            />


            {upcomingPagination && upcomingPagination.total > 3 && (
              <div className="text-center mt-8">
                <Link
                  href="/events?filter=upcoming"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {upcomingPagination.total} upcoming events
                  <span className="text-lg">→</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )} */}

      {/* Search Query and SelectedCategory>*/}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
                {searchQuery || selectedCategory ? t('sections.upcomingEvents.searchResults') : t('sections.upcomingEvents.title')}
              </h2>
              <p className="text-gray-600">
                {eventsData?.pagination.total || 0} {t('sections.upcomingEvents.eventsFound')}
              </p>
            </div>

            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="glass border text-gray-700 hover:bg-white/90"
              >
                {t('sections.upcomingEvents.clearFilters')}
              </Button>
            )}
          </div>

          <EventGrid
            events={eventsData?.events || []}
            isLoading={eventsLoading}
          />


          {eventsData && eventsData.pagination.page < eventsData.pagination.totalPages && (
            <div className="text-center mt-12">
              <FigmaButton
                variant="primary"
                size="lg"
                showGlow={true}
              >
                {t('common.loadMore')}
              </FigmaButton>
            </div>
          )}
        </div>
      </section>
  */}

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
