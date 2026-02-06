'use client';

import { Event } from '@/types';
import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface EventGridProps {
  events: Event[];
  isLoading?: boolean;
  className?: string;
}

function EventCardSkeleton() {
  return (
    <div className="glass border rounded-lg overflow-hidden">
      <Skeleton className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 bg-gray-200" />
          <Skeleton className="h-5 w-20 bg-gray-200" />
        </div>
        <Skeleton className="h-6 w-full bg-gray-200" />
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-2/3 bg-gray-200" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20 bg-gray-200" />
            <Skeleton className="h-3 w-16 bg-gray-200" />
          </div>
          <Skeleton className="h-8 w-24 bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function EventGrid({ events, isLoading, className }: EventGridProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}>
        {Array.from({ length: 6 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="glass border rounded-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('common.noResults')}
          </h3>
          <p className="text-gray-600">
            {t('common.tryAgain')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch",
      className
    )}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
