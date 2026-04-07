import { Ticket, TicketStats } from '@/types/ticket';

export const mockTickets: Ticket[] = [
  {
    id: 'ticket1',
    userId: 'user1',
    eventId: 'event1',
    eventName: 'Summer Music Festival 2024',
    eventDate: new Date('2024-12-15T19:00:00').toISOString(),
    eventLocation: 'Central Park, New York',
    eventImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    ticketType: 'vip',
    ticketNumber: 'SMF2024-VIP-0001',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SMF2024-VIP-0001',
    price: 150.00,
    currency: 'USD',
    status: 'active',
    purchaseDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'trans1',
    seatNumber: 'A15',
    section: 'VIP',
    row: '1',
    transferable: true,
    checkedIn: false,
    notes: 'Early entry at 6:00 PM',
    is_checked_in: true,
  },
 
];

export const mockTicketStats: TicketStats = {
  total: 6,
  active: 3,
  used: 1,
  upcoming: 3,
  past: 2,
  totalSpent: 859.99
};
