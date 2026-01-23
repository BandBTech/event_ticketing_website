import { Event, EventCategory, EventStatus } from '@/types';
import { useDebugValue } from 'react';

export const eventCategories: EventCategory[] = [
  { id: '1', name: 'Music', color: '#FF6B6B', icon: 'music-notes' },
  { id: '2', name: 'Concert', color: '#4ECDC4', icon: 'microphone-stage' },
  { id: '3', name: 'Festival', color: '#45B7D1', icon: 'confetti' },
  { id: '4', name: 'Conference', color: '#96CEB4', icon: 'presentation' },
  { id: '5', name: 'Workshop', color: '#FFEAA7', icon: 'chalkboard-teacher' },
  { id: '6', name: 'Sports', color: '#DDA0DD', icon: 'soccer-ball' },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Kathmandu Music Festival 2025',
    available: 699,
    description: 'The biggest music festival in Nepal featuring international and local artists. Experience three days of non-stop music, food, and entertainment in the heart of Kathmandu.',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=400&fit=crop',
    venue: {
      id: 'v1',
      name: 'Dasharath Stadium',
      address: 'Tripureshwor, Kathmandu',
      city: 'Kathmandu',
      country: 'Nepal',
      capacity: 25000,
      timezone: 'Asia/Kathmandu',
      coordinates: { lat: 27.6915, lng: 85.2936 }
    },
    startDate: '2025-08-12T09:00:00Z',
    is_cancelled: false,
    endDate: '2025-08-14T23:00:00Z',
    categories: [eventCategories[0], eventCategories[1], eventCategories[2]],
    ticketTypes: [
      {
        id: 't1',
        tier_name: 'General',
        price: 2500,
        quantity: 15000,
        sold: 8500,
        currency: 'NPR',
        description: 'General admission with access to all stages',
        gstPercentage: 13,
        sales_start: '2025-01-01T00:00:00Z',
        sales_end: '2025-08-12T06:00:00Z',
        isActive: true,
        available: 500
      },

    ],
    status: 'On Sale' as EventStatus,
    sales_status: 'active',
    organizerId: 'org1',
    maxTicketsPerOrder: 10,
    allowReEntry: true,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z'
  },
  
];
