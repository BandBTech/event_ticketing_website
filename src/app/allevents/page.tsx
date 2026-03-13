'use client';

import { useState } from 'react';
import { EventSearch } from '@/components/events/EventSearch';
import { EventGrid } from '@/components/events/EventGrid';
import { Badge } from '@/components/ui/badge';
import { FigmaButton } from '@/components/ui/figma-button';
import { useEventCategories, useInfiniteEvents } from '@/hooks/useEvents';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteEvents({
    search: searchQuery,
    category: selectedCategory,
    limit: 6,
  });

  const allEvents = data?.pages.flatMap(page => page.events) || [];

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  const { data: categories } = useEventCategories();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
        <EventGrid
          events={allEvents}
          isLoading={isLoading && allEvents.length === 0}
        />
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center">
          <FigmaButton
            variant="primary"
            size="lg"
            showGlow={true}
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t('common.loading')}
              </span>
            ) : (
              t('common.loadMore')
            )}
          </FigmaButton>
          {pagination && (
            <p className="text-gray-600 text-sm mt-3">
              Showing {allEvents.length} of {pagination.total} events
            </p>
          )}
        </div>
      )}
      {/* {!hasNextPage && allEvents.length > 0 && (
        <div className="text-center">
          <p className="text-gray-600">
            {t('common.allEventsLoaded')}
          </p>
        </div>
      )} */}
    </div>
  );
}