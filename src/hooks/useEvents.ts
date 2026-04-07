import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { QueryParams } from '@/types';
import { eventService } from '@/services/eventService';
import { queryKeys } from '@/lib/queryKeys';



export const useEvents = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getPublicEvents(params),
    staleTime: 0, // 5 minutes

  });
};

export const useEventById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.events.byId(id),
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
    staleTime: 0,
    retry: false,
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: () => eventService.getFeaturedEvents(),
    staleTime: 0, 
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => eventService.getEventCategories(),
    staleTime: 0, // 30 minutes
  });
};

export const useInfiniteEvents = (params: Omit<QueryParams, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['infinite-events', params],
    queryFn: ({ pageParam = 1 }) =>
      eventService.getPublicEvents({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
  });
};

export const useUpcomingEvents = (limit: number = 3) => {
  return useInfiniteQuery({
    queryKey: ['upcoming-events-infinite', limit],
    queryFn: ({ pageParam = 1 }) => 
      eventService.getUpcomingEvents({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};
