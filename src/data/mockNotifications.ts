import { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Ticket Purchase Confirmed',
    message: 'Your ticket for "Summer Music Festival 2024" has been confirmed. Check your email for details.',
    type: 'ticket',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'ticket1',
    relatedEntityType: 'ticket',
    actionUrl: '/settings/tickets'
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Event Reminder',
    message: 'Tech Conference 2024 is tomorrow! Don\'t forget to bring your ticket.',
    type: 'event',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'event2',
    relatedEntityType: 'event',
    actionUrl: '/events/event2'
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Payment Processed',
    message: 'Your payment of $150.00 has been successfully processed.',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'trans1',
    relatedEntityType: 'payment',
    actionUrl: '/settings/billing'
  },
  {
    id: '4',
    userId: 'user1',
    title: 'New Event Added',
    message: 'A new comedy show has been added in your area. Check it out!',
    type: 'info',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/events'
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Ticket Transfer Request',
    message: 'John Doe has requested to transfer a ticket for "Art Exhibition 2024" to you.',
    type: 'ticket',
    read: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'ticket2',
    relatedEntityType: 'ticket',
    actionUrl: '/settings/tickets'
  },
  {
    id: '6',
    userId: 'user1',
    title: 'Early Bird Discount',
    message: 'Get 30% off on Food Festival 2024 tickets. Limited time offer!',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/events/food-festival-2024'
  },
  {
    id: '7',
    userId: 'user1',
    title: 'Refund Processed',
    message: 'Your refund of $75.00 for the cancelled event has been processed.',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'trans2',
    relatedEntityType: 'payment'
  },
  {
    id: '8',
    userId: 'user1',
    title: 'Event Cancelled',
    message: 'Unfortunately, "Outdoor Cinema Night" has been cancelled due to weather conditions.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    relatedEntityId: 'event3',
    relatedEntityType: 'event'
  }
];
