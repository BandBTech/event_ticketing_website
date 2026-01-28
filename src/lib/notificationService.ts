import { Notification, NotificationFilters, NotificationPreferences } from '@/types/notification';
import { mockNotifications } from '@/data/mockNotifications';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class NotificationService {
  // Get all notifications for a user
  static async getNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]> {
    await delay(500); // Simulate API call
    
    let notifications = [...mockNotifications].filter(n => n.userId === userId);
    
    // Apply filters
    if (filters) {
      if (filters.unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }
      if (filters.type) {
        notifications = notifications.filter(n => n.type === filters.type);
      }
      if (filters.dateFrom) {
        notifications = notifications.filter(n => new Date(n.createdAt) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        notifications = notifications.filter(n => new Date(n.createdAt) <= new Date(filters.dateTo!));
      }
    }
    
    // Sort by date, newest first
    return notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  // Get single notification
  static async getNotification(id: string): Promise<Notification | null> {
    await delay(300);
    return mockNotifications.find(n => n.id === id) || null;
  }
  
  // Mark notification as read
  static async markAsRead(id: string): Promise<Notification> {
    await delay(300);
    const notification = mockNotifications.find(n => n.id === id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.read = true;
    notification.updatedAt = new Date().toISOString();
    return notification;
  }
  
  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    await delay(500);
    mockNotifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => {
        n.read = true;
        n.updatedAt = new Date().toISOString();
      });
  }
  
  // Delete notification
  static async deleteNotification(id: string): Promise<void> {
    await delay(300);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    mockNotifications.splice(index, 1);
  }
  
  // Get notification preferences
  static async getPreferences(_userId: string): Promise<NotificationPreferences> {
    await delay(300);
    // Return default preferences (in real app, would fetch from API)
    return {
      email: true,
      push: true,
      sms: false,
      ticketUpdates: true,
      eventReminders: true,
      paymentAlerts: true,
      marketingEmails: false
    };
  }
  
  // Update notification preferences
  static async updatePreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    await delay(500);
    // In real app, would save to API
    return {
      email: preferences.email ?? true,
      push: preferences.push ?? true,
      sms: preferences.sms ?? false,
      ticketUpdates: preferences.ticketUpdates ?? true,
      eventReminders: preferences.eventReminders ?? true,
      paymentAlerts: preferences.paymentAlerts ?? true,
      marketingEmails: preferences.marketingEmails ?? false
    };
  }
  
  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    await delay(200);
    return mockNotifications.filter(n => n.userId === userId && !n.read).length;
  }
}
