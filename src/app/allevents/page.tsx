"use client";

import { EventGrid } from "@/components/events/EventGrid";
import { EventSearch } from "@/components/events/EventSearch";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { FigmaButton } from "@/components/ui/figma-button";
import { useInfiniteEvents } from "@/hooks/useEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useState } from "react";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteEvents({
      search: searchQuery,
      category: selectedCategory,
      limit: 6,
    });

  const allEvents = data?.pages.flatMap((page) => page.events) || [];

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <>
      <PageTitle title={t("allevents.pageTitle", "Events")}  />

      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-poppins">
            {t("sections.allEvents.title", "All Events")}
          </h1>
          <p className="text-gray-600 text-lg">
            {t("sections.allEvents.subTitle", "Here you can find all events")}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-2xl mx-auto mb-8 realative">
          <EventSearch
            onSearch={handleSearch}
            placeholder={t("hero.searchPlaceholder", " Search for events...")}
            className="w-full pl-10"
          />
        </div>

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
                  {t("common.loading", "Loading...")}
                </span>
              ) : (
                t("common.loadMore", "Load More Events")
              )}
            </FigmaButton>
            {pagination && (
              <p className="text-gray-600 text-sm mt-3">
                {t("common.pagination.showing", "Showing")} {allEvents.length}{" "}
                {t("common.pagination.of", "of")} {pagination.total}{" "}
                {t("common.pagination.events", "events.")}
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
    </>
  );
}
