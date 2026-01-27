import { create } from 'zustand';
import { type ViewTicketDetails } from '@/types/ticket';

interface TicketStore {
  tickets: ViewTicketDetails | null;
  setTickets: (ticket: ViewTicketDetails | null) => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: null,
  setTickets: (ticket) => set({ tickets: ticket }),
}));
