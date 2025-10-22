// Notification service - temporarily disabled due to Supabase schema mismatch
// This service will be re-enabled once the database schema is updated

export interface NotificationConfig {
  userId: string;
  type: string;
  channel: string;
  recipient: string;
  payload: any;
}

export const sendNotification = async (config: NotificationConfig) => {
  console.log('Notification service disabled - mock implementation');
  return { success: true, message: 'Mock notification sent' };
};

export const getNotifications = async (userId: string) => {
  console.log('Notification service disabled - returning empty array');
  return [];
};

export const markAsRead = async (notificationId: string) => {
  console.log('Notification service disabled - mock mark as read');
  return { success: true };
};

export default {
  sendNotification,
  getNotifications,
  markAsRead,
};
