import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { QueryParams } from '@/types';
import { eventService } from '@/services/eventService';

export const useEvents = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getPublicEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: () => apiClient.getFeaturedEvents(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: () => apiClient.getEventCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useInfiniteEvents = (params: Omit<QueryParams, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['infinite-events', params],
    queryFn: ({ pageParam = 1 }) => 
      apiClient.getEvents({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

