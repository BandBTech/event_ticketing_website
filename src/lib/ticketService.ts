import { Ticket, TicketFilters, TicketStats } from '@/types/ticket';
import { api } from './apiClient';

export interface TicketPaginatedResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export class TicketService {
  /**
   * Get all tickets for authenticated user
   */
  static async getTickets(filters?: TicketFilters & { page?: number; limit?: number }): Promise<TicketPaginatedResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
    }
    
    const query = params.toString();
    const endpoint = `/user/tickets${query ? `?${query}` : ''}`;
    
    return await api.get<TicketPaginatedResponse>(endpoint, {
      requiresAuth: true
    });
  }
  
  /**
   * Get tickets for a specific event
   */
  static async getEventTickets(eventId: string, filters?: { page?: number; limit?: number }): Promise<TicketPaginatedResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const query = params.toString();
    const endpoint = `/user/events/${eventId}/tickets${query ? `?${query}` : ''}`;
    
    return await api.get<TicketPaginatedResponse>(endpoint, {
      requiresAuth: true
    });
  }
  
  /**
   * Get single ticket details
   */
  static async getTicket(id: string): Promise<Ticket> {
    return await api.get<Ticket>(`/user/tickets/${id}`, {
      requiresAuth: true
    });
  }
  
  /**
   * Get ticket QR code data
   */
  static async getQRCode(ticketId: string): Promise<{ qr_data: string; ticket_number: string }> {
    return await api.get<{ qr_data: string; ticket_number: string }>(`/user/tickets/${ticketId}/qr`, {
      requiresAuth: true
    });
  }
  
  /**
   * Get ticket statistics
   */
  static async getTicketStats(): Promise<TicketStats> {
    return await api.get<TicketStats>(`/user/tickets/stats`, {
      requiresAuth: true
    });
  }
  
  /**
   * Get upcoming tickets (client-side filtering for now)
   */
  static async getUpcomingTickets(filters?: { page?: number; limit?: number }): Promise<TicketPaginatedResponse> {
    // Get active tickets and filter upcoming on client side
    return await this.getTickets({ ...filters, status: 'active' });
  }
  
  /**
   * Get past tickets (client-side filtering for now)
   */
  static async getPastTickets(filters?: { page?: number; limit?: number }): Promise<TicketPaginatedResponse> {
    // Get used tickets as past tickets
    return await this.getTickets({ ...filters, status: 'used' });
  }
  
  /**
   * Download ticket (returns URL to PDF)
   * Note: API endpoint not yet available, returns mock URL
   */
  static async downloadTicket(ticketId: string): Promise<{
    pdfUrl: string;
    walletPassUrl?: string;
  }> {
    // TODO: Replace with actual API endpoint when available
    return {
      pdfUrl: `/tickets/${ticketId}/download.pdf`,
      walletPassUrl: `/tickets/${ticketId}/wallet.pkpass`
    };
  }
  
  /**
   * Cancel ticket
   * Note: API endpoint not yet available
   */
  static async cancelTicket(ticketId: string): Promise<Ticket> {
    // TODO: Replace with actual API endpoint when available
    throw new Error('Cancel ticket API endpoint not yet implemented');
  }
  
  /**
   * Transfer ticket
   * Note: API endpoint not yet available
   */
  static async transferTicket(
    ticketId: string, 
    toUserId: string, 
    toUserName: string,
    reason?: string
  ): Promise<Ticket> {
    // TODO: Replace with actual API endpoint when available
    throw new Error('Transfer ticket API endpoint not yet implemented');
  }
  
  /**
   * Search tickets (client-side for now)
   */
  static async searchTickets(query: string): Promise<Ticket[]> {
    // TODO: Implement server-side search when API endpoint is available
    const response = await this.getTickets({ limit: 100 });
    const lowerQuery = query.toLowerCase();
    
    return response.tickets.filter(t => 
      t.eventName?.toLowerCase().includes(lowerQuery) ||
      t.eventLocation?.toLowerCase().includes(lowerQuery) ||
      t.ticketNumber?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Purchase tickets as a guest
   * Sends verification email to the guest
   */
  static async guestPurchase(data: {
    event_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    quantity: number;
    phone?: string;
    country_code?: string;
  }): Promise<{ message: string; verification_required: boolean }> {
    return await api.post<{ message: string; verification_required: boolean }>(
      '/public/tickets/guest-purchase', 
      data, 
      {
        requiresAuth: false,
        showErrorToast: false, // Let the component handle error toasts
      }
    );
  }
}
