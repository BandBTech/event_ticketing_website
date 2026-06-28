"use client";

import { EventGrid } from "@/components/events/EventGrid";
import { EventSearch } from "@/components/events/EventSearch";
import { PageTitle } from "@/components/pagetitle/PageTitle";
import { FigmaButton } from "@/components/ui/figma-button";
import { Badge } from "@/components/ui/badge";
import { useInfiniteEvents } from "@/hooks/useEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Event } from "@/types/event";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // empty string means "All"

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteEvents({
      search: searchQuery,
      status: selectedStatus || undefined,
      limit: 6,
    });

  const allEvents = data?.pages.flatMap((page) => page.events) || [];

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

  const sortedEvents = sortEvents(allEvents);

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(selectedStatus === status ? "" : status);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Status options for filtering
  const statusOptions = [
    { key: "", label: t("common.all", "All") },
    { key: "on_sale", label: t("sections.onSale.title", "On Sale Now") },
    { key: "sales_upcoming", label: t("sections.salesUpcoming.title", "Upcoming Sales") },
    { key: "scheduled", label: t("sections.scheduledEvents.title", "Scheduled Events") },
  ];

  return (
    <>
      <PageTitle title={t("allevents.pageTitle", "Events")} />

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
        <div className="max-w-2xl mx-auto mb-8 space-y-6">
          <div className="relative">
            <EventSearch
              onSearch={handleSearch}
              placeholder={t("hero.searchPlaceholder", "Search for events...")}
              className="w-full pl-10"
            />
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            {statusOptions.map((opt) => (
              <Badge
                key={opt.key}
                variant="outline"
                className={cn(
                  "px-4 py-2 cursor-pointer transition-all duration-300 text-sm font-medium",
                  "glass border text-gray-700 hover:bg-white/90",
                  selectedStatus === opt.key && "bg-blue-600/10 border-blue-400 text-blue-600 hover:bg-blue-600/15"
                )}
                onClick={() => handleStatusSelect(opt.key)}
              >
                {opt.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div className="mb-12">
          <EventGrid
            events={sortedEvents}
            isLoading={isLoading && sortedEvents.length === 0}
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
                {t("common.pagination.showing", "Showing")} {sortedEvents.length}{" "}
                {t("common.pagination.of", "of")} {pagination.total}{" "}
                {t("common.pagination.events", "events.")}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
