'use client';

import { useState } from 'react';
import { TicketIcon, CalendarDotsIcon, MapPinIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { FigmaButton } from '@/components/ui/figma-button';
import { EventSearch } from '@/components/events/EventSearch';
import { EventGrid } from '@/components/events/EventGrid';
import { Badge } from '@/components/ui/badge';
import { useEvents, useFeaturedEvents, useEventCategories } from '@/hooks/useEvents';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    search: searchQuery,
    category: selectedCategory,
    limit: 6,
  });

  const { data: featuredEvents, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: categories } = useEventCategories();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border">
                <TicketIcon size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {t('hero.badge')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 font-poppins">
                {t('hero.title').split(' ').slice(0, 2).join(' ')}{' '}
                <span className="gradient-text">{t('hero.title').split(' ')[2]}</span>
                <br />
                {t('hero.title').split(' ').slice(3).join(' ')}
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <EventSearch
                onSearch={handleSearch}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 text-sm">{t('hero.stats.events')}</div>
              </div>
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
                <div className="text-gray-600 text-sm">{t('hero.stats.tickets')}</div>
              </div>
              <div className="glass rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
                <div className="text-gray-600 text-sm">{t('hero.stats.cities')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                {t('sections.featuredEvents.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('sections.featuredEvents.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-1">
                          <CalendarDotsIcon weight="duotone" size={16} />
                          <span>Aug 12</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon weight="duotone" size={16} />
                          <span>{event.venue.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className={cn(
                    "px-4 py-2 cursor-pointer transition-all duration-300",
                    "glass border text-gray-700 hover:bg-white/90",
                    selectedCategory === category.name && "bg-blue-500/20 border-blue-400/50 text-blue-700"
                  )}
                  onClick={() => handleCategorySelect(category.name)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Grid Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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

          {/* Load More Button */}
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-strong rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
              {t('sections.cta.title')}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {t('sections.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <FigmaButton
                variant="primary"
                size="xl"
                showGlow={true}
              >
                <UsersIcon weight="duotone" size={20} />
                {t('sections.cta.organizeEvent')}
              </FigmaButton>
              <FigmaButton
                variant="glass"
                size="xl"
              >
                {t('sections.cta.learnMore')}
              </FigmaButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
