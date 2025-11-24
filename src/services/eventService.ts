import { api } from '@/lib/apiClient';
import { Event, EventStatus, TicketCategory } from '@/types/event';

export interface PublicEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
}

export interface FeaturedEventsParams {
  limit?: number;
}

export interface EventCategoriesParams {
  limit?: number;
}

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  event_count?: number;
}

interface ApiEventTier {
  id: string;
  tier_name: string;
  price: number;
  quantity: number;
  sold: number;
  gst: number;
  sales_start: string;
  sales_end: string;
  is_active: boolean;
}

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  banner_image: string;
  venue_name: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string[];
  status: string;
  organizer_id: string;
  capacity: number;
  created_at: string;
  updated_at: string;
  tiers: ApiEventTier[];
}

interface ApiEventsResponse {
  data: {
    events: ApiEvent[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

const mapStatus = (status: string): EventStatus => {
  const statusMap: Record<string, EventStatus> = {
    'draft': 'Draft',
    'published': 'Published',
    'approved': 'On Sale', // Assuming approved means on sale for public
    'on_sale': 'On Sale',
    'sale_on_hold': 'Sale on Hold',
    'sold_out': 'Sold Out',
    'closed': 'Closed',
    'cancelled': 'Cancelled',
    'held': 'Sale on Hold'
  };
  return statusMap[status.toLowerCase()] || 'Published';
};

const mapEvent = (apiEvent: ApiEvent): Event => {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    imageUrl: apiEvent.banner_image || '/images/placeholder-event.jpg', // Fallback image
    bannerImageUrl: apiEvent.banner_image,
    venue: {
      id: 'venue-' + apiEvent.id, // Mock ID as API doesn't return venue object ID
      name: apiEvent.venue_name,
      address: apiEvent.location, // Using location as address for now
      city: apiEvent.location.split(',')[0]?.trim() || apiEvent.location, // Simple heuristic
      country: 'Nepal', // Default or parse from location
      capacity: apiEvent.capacity,
      timezone: 'Asia/Kathmandu', // Default
    },
    startDate: apiEvent.start_date,
    endDate: apiEvent.end_date,
    categories: (apiEvent.category || []).map((cat, index) => ({
      id: `cat-${index}`,
      name: cat,
      color: 'blue', // Default color
    })),
    ticketTypes: (apiEvent.tiers || []).map(tier => ({
      id: tier.id,
      name: tier.tier_name as TicketCategory, // Type assertion, might need validation
      price: tier.price,
      quantity: tier.quantity,
      sold: tier.sold,
      gstPercentage: tier.gst,
      salesStartDate: tier.sales_start,
      salesEndDate: tier.sales_end,
      isActive: tier.is_active,
    })),
    status: mapStatus(apiEvent.status),
    organizerId: apiEvent.organizer_id,
    maxTicketsPerOrder: 10, // Default
    allowReEntry: false, // Default
    createdAt: apiEvent.created_at,
    updatedAt: apiEvent.updated_at,
  };
};

export const eventService = {
  getPublicEvents: async (params: PublicEventsParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await api.get<ApiEventsResponse>(`/public/events?${queryParams.toString()}`);
    
    // The API response structure might vary, adjusting based on common patterns
    // If response.data is the object containing events, use it.
    // If response itself is the object (handled by apiClient), check that.
    // apiClient returns data.data or data.
    
    // Based on find_paths.js output, response 200 schema has data object.
    // And apiClient returns data.data || data.
    // So we likely get { events: [...], pagination: {...} } directly.
    
    const responseData = response as unknown as { events: ApiEvent[], pagination: { total: number; page: number; limit: number; total_pages: number; } };
    
    return {
      events: (responseData.events || []).map(mapEvent),
      pagination: {
        ...responseData.pagination,
        totalPages: responseData.pagination.total_pages
      }
    };
  },

  getFeaturedEvents: async (params: FeaturedEventsParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiEventsResponse>(`/public/events/featured?${queryParams.toString()}`);
    
    const responseData = response as unknown as { events: ApiEvent[] };
    
    return (responseData.events || []).map(mapEvent);
  },

  getEventCategories: async (params: EventCategoriesParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<{ data: ApiCategory[] }>(`/public/categories?${queryParams.toString()}`);
    
    const responseData = response as unknown as { categories: ApiCategory[] };
    
    return (responseData.categories || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      eventCount: cat.event_count || 0,
    }));
  },

  getEventByCategory: async (category: string, params: EventCategoriesParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<{ data: ApiEvent[] }>(`/public/categories/${category}?${queryParams.toString()}`);
    
    const responseData = response as unknown as { events: ApiEvent[] };
    
    return (responseData.events || []).map(mapEvent);
  },
};