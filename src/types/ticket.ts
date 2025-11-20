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
