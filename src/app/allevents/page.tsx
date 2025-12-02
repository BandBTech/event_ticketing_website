'use client';

import { useState } from 'react';
import { EventSearch } from '@/components/events/EventSearch';
import { EventGrid } from '@/components/events/EventGrid';
import { Badge } from '@/components/ui/badge';
import { FigmaButton } from '@/components/ui/figma-button';
import { useEvents, useEventCategories } from '@/hooks/useEvents';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    search: searchQuery,
    category: selectedCategory,
    limit: 6,
  });

  const { data: categories } = useEventCategories();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 font-poppins">
          {t('sections.allEvents.title')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('sections.allEvents.subTitle')}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="max-w-2xl mx-auto mb-8 realative">
        <EventSearch
          onSearch={handleSearch}
          placeholder={t('hero.searchPlaceholder')}
          className="w-full pl-10"
        />
      </div>

      {categories && categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant="outline"
              className={cn(
                "px-4 py-2 cursor-pointer transition-all duration-300",
                "glass border text-gray-700 hover:bg-white/90",
                selectedCategory === category.name &&
                  "bg-primary/20 border-blue-400/50 text-primary"
              )}
              onClick={() => handleCategorySelect(category.name)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Event Grid */}
      <div className="mb-12">
        <EventGrid events={eventsData?.events || []} isLoading={eventsLoading} />
      </div>

      {/* Load More */}
      {eventsData && eventsData.pagination.page < eventsData.pagination.totalPages && (
        <div className="text-center">
          <FigmaButton variant="primary" size="lg" showGlow={true}>
            {t('common.loadMore')}
          </FigmaButton>
        </div>
      )}
    </div>
  );
}
