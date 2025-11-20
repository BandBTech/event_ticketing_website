export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ticket' | 'payment' | 'event';
  read: boolean;
  createdAt: string;
  updatedAt: string;
  relatedEntityId?: string;
  relatedEntityType?: 'ticket' | 'event' | 'payment';
  actionUrl?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  ticketUpdates: boolean;
  eventReminders: boolean;
  paymentAlerts: boolean;
  marketingEmails: boolean;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: Notification['type'];
  dateFrom?: string;
  dateTo?: string;
}
