import { z } from 'zod';

export const TicketStatusSchema = z.enum(['active', 'used', 'cancelled', 'expired', 'transferred', 'valid']);

export const ViewTicketResponseSchema = z.object({
  id: z.string(),
  ticket_number: z.string(),
  status: TicketStatusSchema,
  qr_code_url: z.string().optional(),
  event: z.object({
    id: z.string(),
    title: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    imageUrl: z.string().optional(),
    venue: z.object({
      name: z.string(),
      address: z.string(),
      city: z.string().optional(),
    }).optional(),
  }),
  tier: z.object({
    name: z.string(),
    price: z.number(),
    currency: z.string(),
  }).optional(),
  guest: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
  }).optional(),
});

export type ViewTicketDetails = z.infer<typeof ViewTicketResponseSchema>;

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
