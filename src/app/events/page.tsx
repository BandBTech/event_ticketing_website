
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';
import { useEventFilterStore } from '@/store/eventFilterStore';
import { useEvents } from '@/hooks/useEvents';
import { EventGrid } from '@/components/events/EventGrid';
import { EventSearch } from '@/components/events/EventSearch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Funnel, MapPin, Calendar, SortAscending, SortDescending } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function EventsPage() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Global Filter State
  const {
    search, location, startDate, endDate, sort, page,
    setSearch, setLocation, setStartDate, setEndDate, setSort, setPage, resetFilters
  } = useEventFilterStore();

  // Local state for date pickers (Date objects)
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  );
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  );

  // Sync date objects with filter store
  useEffect(() => {
    if (startDateObj) {
      setStartDate(format(startDateObj, 'yyyy-MM-dd'));
    } else {
      setStartDate('');
    }
  }, [startDateObj, setStartDate]);

  useEffect(() => {
    if (endDateObj) {
      setEndDate(format(endDateObj, 'yyyy-MM-dd'));
    } else {
      setEndDate('');
    }
  }, [endDateObj, setEndDate]);

  // Fetch Events using React Query
  const { data, isLoading, error, isError } = useEvents({
    page,
    limit: 9,
    search: search || undefined,
    location: location || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sort,
  });

  const events = data?.events || [];
  const pagination = data?.pagination;

  // Handle Errors
  useEffect(() => {
    if (isError) {
      console.error('Failed to fetch events:', error);
      toast.error(t('common.error'), {
        description: t('events.fetchError', 'Failed to load events'),
      });
    }
  }, [isError, error, t]);

  // Custom reset handler to clear both store and local state
  const handleResetFilters = () => {
    resetFilters();
    setStartDateObj(undefined);
    setEndDateObj(undefined);
  };

  return (
    <div className="min-h-screen">

      <div className="pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-primary">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse" />
            <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white/20 rounded-lg rotate-45 animate-spin-slow" />
            <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white/20 rounded-full animate-bounce-slow" />
            <div className="absolute top-1/2 right-10 w-24 h-24 border-2 border-white/10 rounded-full" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10 py-24 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fade-in">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white">
                  {t('events.liveBadge', 'Live Events Available')}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
                <span className="block text-white mb-2">
                  {t('events.discoverTitle', 'Discover')}
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200">
                  {t('events.amazingEvents', 'Amazing Events')}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
                {t('events.heroSubtitle', 'Find and book tickets for concerts, workshops, conferences, and more. Your next unforgettable experience awaits.')}
              </p>

              {/* Search Bar in Hero */}
              <div className="max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
                <div className="relative">
                  <EventSearch
                    onSearch={setSearch}
                    value={search}
                    placeholder={t('events.searchPlaceholder', "Search for events, artists, or venues...")}
                    className="shadow-2xl backdrop-blur-sm bg-white/95 border-white/20"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12 animate-fade-in-up animation-delay-600">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {pagination?.total || '500+'}
                  </div>
                  <div className="text-sm text-white/70">
                    {t('events.totalEvents', 'Events')}
                  </div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                  <div className="text-sm text-white/70">
                    {t('events.categories', 'Categories')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                  <div className="text-sm text-white/70">
                    {t('events.attendees', 'Attendees')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-16 md:h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="white" />
            </svg>
          </div>
        </div>

        {/* Filters Section */}
        <div className="container mx-auto px-4 -mt-8 relative z-20 mb-12">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl p-6 -mt-20">
            <div className="flex items-center gap-2 mb-6">
              <Funnel size={20} className="text-blue-600" weight="duotone" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t('events.filters', 'Filter Events')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Location Filter */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin size={16} weight="duotone" /> {t('events.location', 'Location')}
                </label>
                <Input
                  id="location"
                  placeholder={t('events.locationPlaceholder', 'City or Venue')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white/70 border-gray-200 focus:border-blue-400 h-11"
                />
              </div>

              {/* Start Date Filter */}
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar size={16} weight="duotone" /> {t('events.startDate', 'From')}
                </label>
                <DatePicker
                  id="startDate"
                  date={startDateObj}
                  onDateChange={setStartDateObj}
                  placeholder={t('events.selectStartDate', 'Select start date')}
                />
              </div>

              {/* End Date Filter */}
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar size={16} weight="duotone" /> {t('events.endDate', 'To')}
                </label>
                <DatePicker
                  id="endDate"
                  date={endDateObj}
                  onDateChange={setEndDateObj}
                  placeholder={t('events.selectEndDate', 'Select end date')}
                />
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {sort.startsWith('-') ? <SortDescending size={16} weight="duotone" /> : <SortAscending size={16} weight="duotone" />}
                  {t('events.sortBy', 'Sort By')}
                </label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger id="sort" className="bg-white/70 border-gray-200 focus:border-blue-400 h-11">
                    <SelectValue placeholder={t('events.sortPlaceholder', 'Sort by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">{t('events.sort.newestFirst', 'Newest First')}</SelectItem>
                    <SelectItem value="created_at">{t('events.sort.oldestFirst', 'Oldest First')}</SelectItem>
                    <SelectItem value="start_date">{t('events.sort.dateSooner', 'Date: Sooner')}</SelectItem>
                    <SelectItem value="-start_date">{t('events.sort.dateLater', 'Date: Later')}</SelectItem>
                    <SelectItem value="price">{t('events.sort.priceLowHigh', 'Price: Low to High')}</SelectItem>
                    <SelectItem value="-price">{t('events.sort.priceHighLow', 'Price: High to Low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <Funnel size={16} className="mr-2" weight="duotone" />
                {t('common.clearFilters', 'Clear All Filters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('events.upcomingEvents', 'Upcoming Events')}
            </h2>
            <div className="text-sm text-gray-500">
              {pagination?.total || 0} {t('events.eventsFound', 'events found')}
            </div>
          </div>

          <EventGrid events={events} isLoading={isLoading} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="glass"
              >
                {t('common.previous', 'Previous')}
              </Button>
              <div className="flex items-center px-4 font-medium text-gray-600">
                {t('common.page', 'Page')}{page} {t('common.of', 'of')}{pagination.totalPages}
              </div>
              <Button
                variant="outline"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                className="glass"
              >
                {t('common.next', 'Next')}
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
