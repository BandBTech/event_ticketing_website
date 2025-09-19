import { EventsResponse, Event, EventFilters, QueryParams } from '@/types';
import { mockEvents, eventCategories } from '@/data/mockEvents';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API client
export class ApiClient {
  private baseUrl = '/api';

  async getEvents(params: QueryParams = {}): Promise<EventsResponse> {
    await delay(500); // Simulate network delay

    const {
      page = 1,
      limit = 6,
      search = '',
      category = '',
      status = '',
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = params;

    let filteredEvents = [...mockEvents];

    // Apply search filter
    if (search) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.venue.city.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category) {
      filteredEvents = filteredEvents.filter(event =>
        event.categories.some(cat => cat.name.toLowerCase() === category.toLowerCase())
      );
    }

    // Apply status filter
    if (status) {
      filteredEvents = filteredEvents.filter(event =>
        event.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Apply sorting
    filteredEvents.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Event];
      let bValue: any = b[sortBy as keyof Event];

      if (sortBy === 'startDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'desc') {
        return bValue - aValue;
      }
      return aValue - bValue;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return {
      events: paginatedEvents,
      pagination: {
        page,
        limit,
        total: filteredEvents.length,
        totalPages: Math.ceil(filteredEvents.length / limit)
      }
    };
  }

  async getEvent(id: string): Promise<Event | null> {
    await delay(300);
    return mockEvents.find(event => event.id === id) || null;
  }

  async getEventCategories() {
    await delay(200);
    return eventCategories;
  }

  async getFeaturedEvents(): Promise<Event[]> {
    await delay(400);
    return mockEvents.filter(event => event.status === 'On Sale').slice(0, 3);
  }
}

export const apiClient = new ApiClient();
