import { create } from 'zustand';

export interface EventFiltersState {
  search: string;
  location: string;
  startDate: string;
  endDate: string;
  sort: string;
  page: number;
  
  setSearch: (search: string) => void;
  setLocation: (location: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useEventFilterStore = create<EventFiltersState>((set) => ({
  search: '',
  location: '',
  startDate: '',
  endDate: '',
  sort: '-created_at',
  page: 1,

  setSearch: (search) => set({ search, page: 1 }),
  setLocation: (location) => set({ location, page: 1 }),
  setStartDate: (startDate) => set({ startDate, page: 1 }),
  setEndDate: (endDate) => set({ endDate, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({
    search: '',
    location: '',
    startDate: '',
    endDate: '',
    sort: '-created_at',
    page: 1
  }),
}));
