import { api } from '@/lib/apiClient';
import { Event, EventStatus, TicketType } from '@/types/event';

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
  available: number;
  currency: string;
  quantity: number;
  sold: number;
  gst: number;
  sales_start: string;
  sales_end: string;
  is_active: boolean;
}

interface ApiOrganizer {
  id: string;
  business_name: string;
  business_logo_url: string;
}

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  banner_image: string;
  venue_name: string;
  address: string;
  location: string;
  start_date: string;
  end_date: string;
  category: string;
  status: string;
  organizer: ApiOrganizer;
  capacity: number;
  created_at: string;
  updated_at?: string;
  timezone?: string;
  available?: number;
  price?: number;
  sales_status?: string;
  is_featured?: boolean;
  is_cancelled?: boolean;
  tiers: ApiEventTier[];
}

interface ApiEventsResponse {
  success: boolean;
  message: string;

  events: ApiEvent[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
};

interface ApiUpcomingEventsResponse {
  events: ApiEvent[];
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;

}

const mapStatus = (status: string): EventStatus => {
  const statusMap: Record<string, EventStatus> = {
    'draft': 'Draft',
    'completed': 'Completed',
    'on_sale': 'On Sale',
    'sale_on_hold': 'Sale on Hold',
    'sold_out': 'Sold Out',
    'closed': 'Closed',
    'cancelled': 'Cancelled',
    'held': 'Sale on Hold',
    'approved': 'Approved',
  };
  return statusMap[status.toLowerCase()];
};

const parseCategoryString = (categoryStr: string): string[] => {
  if (!categoryStr) return [];

  try {
    const cleanStr = categoryStr.replace(/[{}"]/g, '');
    return cleanStr.split(',').filter(cat => cat.trim() !== '').map(cat => cat.trim());
  } catch {
    return [];
  }
};

const mapTier = (tier: ApiEventTier): TicketType => ({
  id: tier.id,
  tier_name: tier.tier_name,
  price: tier.price ?? 0,
  quantity: tier.available ?? tier.quantity ?? 0,
  sold: tier.sold ?? 0,
  currency: tier.currency,
  gstPercentage: tier.gst ?? 0,
  sales_start: tier.sales_start,
  sales_end: tier.sales_end,
  available: tier.available,
  isActive: tier.is_active ?? true,

});

const mapEvent = (apiEvent: ApiEvent): Event => {
  // Parse category string to array
  const categories = parseCategoryString(apiEvent.category);

  // Use address if location is empty
  const location = apiEvent.location || apiEvent.address || 'Unknown Location';
  const city = location.split(',')[0]?.trim() || 'Unknown City';

  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    imageUrl: apiEvent.banner_image || '/images/placeholder-event.jpg',
    bannerImageUrl: apiEvent.banner_image,
    venue: {
      id: 'venue-' + apiEvent.id,
      name: apiEvent.venue_name || 'Unknown Venue',
      address: location,
      city: city,
      country: 'Nepal',
      capacity: apiEvent.capacity || 0,
      timezone: apiEvent.timezone || 'Asia/Kathmandu',
    },
    startDate: apiEvent.start_date,
    endDate: apiEvent.end_date,
    categories: categories.map((cat, index) => ({
      id: `cat-${index}`,
      name: cat,
      color: 'blue',
    })),
    ticketTypes: (apiEvent.tiers || []).map(mapTier),
    status: mapStatus(apiEvent.status),
    organizer: apiEvent.organizer ? {
      id: apiEvent.organizer.id,
      business_name: apiEvent.organizer.business_name,
      business_logo: apiEvent.organizer.business_logo_url,
    } : {
      id: 'default',
      business_name: 'Organizer',
      business_logo: '',
    },
    maxTicketsPerOrder: 10,
    allowReEntry: false,
    available: apiEvent.available || 0,
    createdAt: apiEvent.created_at,
    updatedAt: apiEvent.updated_at || apiEvent.created_at,
    sales_status: apiEvent.sales_status || 'active',
    is_cancelled: apiEvent.is_cancelled || false,
    is_featured: apiEvent.is_featured || false,
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
    return {
      events: (response.events || []).map(mapEvent),
      pagination: {
        total: response.pagination.total,
        page: response.pagination.page,
        limit: response.pagination.limit,
        totalPages: response.pagination.total_pages,
      },
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

    const response = await api.get<{ categories: ApiCategory[] }>(`/public/categories?${queryParams.toString()}`);

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

    const response = await api.get<{ events: ApiEvent[] }>(`/public/categories/${category}?${queryParams.toString()}`);

    const responseData = response as unknown as { events: ApiEvent[] };

    return (responseData.events || []).map(mapEvent);
  },

  getEventById: async (id: string): Promise<Event> => {
    try {
      const response = await api.get<ApiEvent>(`/public/events/${id}`);

      return mapEvent(response);
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw new Error(`Failed to fetch event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getUpcomingEvents: async (params: PublicEventsParams = {}) => {
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

    const response = await api.get<ApiUpcomingEventsResponse>(`/public/events/upcoming?${queryParams.toString()}`);

    return {
      events: (response.events || []).map(mapEvent),
      pagination: {
        total: response.total_items || 0,
        page: response.current_page || 1,
        limit: response.limit || 10,
        totalPages: response.total_pages || 1,
      },
    };
  }
};



