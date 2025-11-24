import { useQuery } from '@tanstack/react-query';
import { eventService, PublicEventsParams, FeaturedEventsParams, EventCategoriesParams } from '@/services/eventService';

export function useEvents(params: PublicEventsParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getPublicEvents(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

export function useFeaturedEvents(params: FeaturedEventsParams) {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventService.getFeaturedEvents(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

export function useEventCategories(params: EventCategoriesParams) {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => eventService.getEventCategories(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

