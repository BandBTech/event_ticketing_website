
// API Response Types (snake_case) - matches actual /public/tickets/view response
export interface ApiTicketItem {
  ticket_id: string;
  ticket_number: string;
  tier_name?: string;
  tierName?: {
    id: string;
    name: string;
  };
  tier?: {
    id: string;
    name: string;
  };
  price: number;
  qr_data: string; // base64 encoded QR data
  checked_in: boolean;
  is_checked_in?: boolean;
  status: string;
}

export interface ApiTicketResponse {
  order_id: string;
  event: {
    id: string;
    title: string;
    banner_image?: string;
    venue_name: string;
    address: string;
    start_date: string;
    timezone?: string;
    end_date: string;

    organizer?: {
      id: string;
      // name: string;
      // logo?: string;
      business_logo_url?: string;
      business_name?: string;
    };
  };
  ticket_count: number;
  transaction_status: string;
  tickets: ApiTicketItem[];
  total_amount: number;
  currency: string;
  purchase_date: string;
  is_guest_purchase?: boolean;
  company?: {
    id: string;
    name: string;
    logo_url?: string;
    email?: string;
  };
}

// Frontend Model Types (camelCase) - used by Components
export interface TicketItem {
  ticketId: string;
  ticketNumber: string;
  status: string;
  //tierName: string;
  tierName:{
  id: string;
  name: string;
  };
  price?: number;
  qrData: string;
  checkedIn: boolean;
  is_checked_in: boolean;
  checkInTime?: string | null;
  checkIns?: Array<{
    id: string;
    eventDay?: { id: string; name: string; startTime: string; endTime: string };
    checkedInAt: string;
  }>;
}

export interface ViewTicketDetails {
  orderId: string;
  ticketCount: number;
  transactionStatus: string;
  event: {
    id: string;
    title: string;
    imageUrl?: string;
    venueName: string;
    address: string;
    startDate: string;
    endDate: string;
    timezone?: string;
    organizer?: {
      id: string;
      // name: string;
      // logo?: string;
      business_logo_url?: string;
      business_name?: string;
    };
  };
  tickets: TicketItem[];
  totalAmount: number;

  currency: string;
  purchaseDate: string;
  company?: {
    name: string;
    logoUrl?: string;
  };

}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  ticketType: 'general' | 'vip' | 'premium' | 'early_bird';
  ticketNumber: string;
  qrCode: string;
  price: number;
  currency: string;
  status: 'active' | 'used' | 'cancelled' | 'expired' | 'transferred';
  purchaseDate: string;
  transactionId: string;
  seatNumber?: string;
  section?: string;
  row?: string;
  transferable: boolean;
  transferHistory?: TransferRecord[];
  checkedIn: boolean;
  is_checked_in : boolean;
  checkedInAt?: string;
  notes?: string;
}

export interface TransferRecord {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  transferDate: string;
  transferReason?: string;
}

export interface TicketFilters {
  status?: Ticket['status'];
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
  ticketType?: Ticket['ticketType'];
}

export interface TicketStats {
  total: number;
  active: number;
  used: number;
  upcoming: number;
  past: number;
  totalSpent: number;
}

export interface ApiUserTicket {
  id: string;
  ticket_number: string;
  ticket_count: number;
  total_amount: number;
  payment_gateway: string;
  status: string;
  created_at: string;
  transaction_status: string;
  event: {
    id: string;
    title: string;
    banner_image: string;
    venue_name: string;
    address: string;
    start_date: string;
    end_date: string;
    timezone: string;
    organizer_id: string;
  };
  tickets: TicketItem[];
 tier_name: string;
}

export interface UserTicketsApiResponse {
  tickets: ApiUserTicket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiSingleTicketResponse {
  success: boolean;
  message: string;
  data: ApiUserTicket;
  timestamp: string;
  request_id?: string;
}

export interface ApiTierResponse {
  success: boolean;
  message: string;
  data: ApiTicketItem[];
  timestamp: string;
  request_id?: string;
}

export interface PaginatedUserTickets {
  tickets: ViewTicketDetails[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

export interface EventTicketsApiResponse {
  success: boolean;
  data: {
    tickets: ApiTicketItem[]; // The snake_case items from your JSON
    pagination: {
      has_next: boolean;
      has_prev: boolean;
      limit: number;
      page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface ApiTransaction {
  id: string;
  event: {
    id: string;
    title: string;
    banner_image: string;
    venue_name: string;
    address: string;
    start_date: string;
    end_date: string;
    status: string;
    timezone?: string;
  };
  tickets: Array<{
    id: string;
    ticket_number: string;
    status: string;
    tier: {
      id: string;
      name: string;
    };
    qr_data: string;
    is_checked_in?: boolean;
    check_in_time?: string | null;
    checked_in_by?: string | null;
    check_ins?: Array<{
      id: string;
      event_day?: {
        id: string;
        name: string;
        start_time: string;
        end_time: string;
      };
      checked_in_by: string;
      checked_in_at: string;
    }>;
  }>;
  transaction_status: string;
  created_at: string;
  updated_at: string;
}
export interface TransactionDetailApiResponse {
  success: boolean;
  message: string;
  data: ApiTransaction;
  timestamp: string;
}

export interface ViewTicketDetail {
  orderId: string;
  ticketCount: number;
  transactionStatus: string;
  purchaseDate: string;
  event: {
    id: string;
    title: string;
    imageUrl: string;
    venueName: string;
    address: string;
    startDate: string;
    endDate: string;
  };
  tickets: TicketItems[];
}

export interface TicketItems {
  ticketId: string;
  ticketNumber: string;
  status: string;
  tierName: { id: string; name: string };
  qrData: string;
  is_checked_in: boolean;
  checkInTime?: string | null;
  checkIns?: Array<{
    id: string;
    eventDay?: { id: string; name: string; startTime: string; endTime: string };
    checkedInAt: string;
  }>;
}
