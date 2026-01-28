export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired' | 'transferred' | 'valid';

// API Response Types (snake_case) - matches actual /public/tickets/view response
export interface ApiTicketItem {
  ticket_id: string;
  ticket_number: string;
  tier_name: string;
  price: number;
  qr_data: string; // base64 encoded QR data
  checked_in: boolean;
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
    organizer?: {
      id: string;
      name: string;
      logo?: string;
    };
  };
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
  tierName: string;
  price: number;
  qrData: string;
  checkedIn: boolean;
}

export interface ViewTicketDetails {
  orderId: string;
  event: {
    id: string;
    title: string;
    imageUrl?: string;
    venueName: string;
    address: string;
    startDate: string;
    timezone?: string;
    organizer?: {
      id: string;
      name: string;
      logo?: string;
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
