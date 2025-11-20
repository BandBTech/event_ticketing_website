import { api } from './apiClient';
import { Event } from '@/types/event';

/**
 * Event Service
 * Handles all public event-related API calls
 */

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export class EventService {
  /**
   * Get all approved public events with pagination and filters
   */
  static async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.category) params.append('category', filters.category);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.sort) params.append('sort', filters.sort);
    }
    
    const query = params.toString();
    const endpoint = `/public/events${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<Event> {
    return await api.get<Event>(`/public/events/${id}`);
  }

  /**
   * Get featured events (top 3 for homepage)
   */
  static async getFeaturedEvents(limit: number = 3): Promise<Event[]> {
    return await api.get<Event[]>(`/public/events/featured?limit=${limit}`);
  }

  /**
   * Get upcoming events
   */
  static async getUpcomingEvents(filters?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
    }
    
    const query = params.toString();
    const endpoint = `/public/events/upcoming${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }

  /**
   * Search events
   */
  static async searchEvents(query: string, filters?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
    }
    
    return await api.get<PaginatedResponse<Event>>(`/public/events/search?${params.toString()}`);
  }

  /**
   * Get events by category
   */
  static async getEventsByCategory(category: string, filters?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const query = params.toString();
    const endpoint = `/public/events/category/${category}${query ? `?${query}` : ''}`;
    
    return await api.get<PaginatedResponse<Event>>(endpoint);
  }
}
