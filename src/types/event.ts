export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bannerImageUrl?: string;
  venue: Venue;
  startDate: string;
  endDate: string;
  categories: EventCategory[];
  ticketTypes: TicketType[];
  status: EventStatus;
  organizerId: string;
  maxTicketsPerOrder: number;
  allowReEntry: boolean;
  createdAt: string;
  updatedAt: string;
  sales_status: string;
  is_cancelled: boolean;
  available: number;

}


export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  capacity: number;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TicketType {
  id: string;
  tier_name: TicketCategory;
  price: number;
  quantity: number;
  sold: number;
  currency: string;
  description?: string;
  gstPercentage: number;
  sales_start: string;
  sales_end: string;
  isActive: boolean;
  available: number;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type TicketCategory = 'General' | 'Premium' | 'VIP' | 'VVIP';

export type EventStatus = 'Draft' | 'Published' | 'On Sale' | 'Sale on Hold' | 'Sold Out' | 'Closed' | 'Cancelled';

export interface EventFilters {
  search?: string;
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  status?: EventStatus[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

