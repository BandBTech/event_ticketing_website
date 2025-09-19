import { create } from 'zustand';
import { Event, EventFilters } from '@/types';

interface EventStore {
  // State
  events: Event[];
  featuredEvents: Event[];
  selectedEvent: Event | null;
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setEvents: (events: Event[]) => void;
  setFeaturedEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  // Initial state
  events: [],
  featuredEvents: [],
  selectedEvent: null,
  filters: {},
  isLoading: false,
  error: null,

  // Actions
  setEvents: (events) => set({ events }),
  
  setFeaturedEvents: (featuredEvents) => set({ featuredEvents }),
  
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    })),
  
  clearFilters: () => set({ filters: {} }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
}));
