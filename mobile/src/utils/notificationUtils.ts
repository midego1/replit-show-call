import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!supportsNotifications()) {
    return false;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// Check if the device supports notifications
export function supportsNotifications(): boolean {
  return Platform.OS !== 'web';
}

// Check if notifications are enabled
export async function areNotificationsEnabled(): Promise<boolean> {
  if (!supportsNotifications()) {
    return false;
  }
  
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Schedule a notification for a show
export async function scheduleShowNotification(
  showTitle: string,
  showTime: Date,
  minutesBefore: number,
  channelId = 'show-calls'
): Promise<string | null> {
  if (!await areNotificationsEnabled()) {
    console.log('Notifications not enabled, not scheduling notification');
    return null;
  }
  
  // Calculate notification time (showTime - minutesBefore minutes)
  const notificationTime = new Date(showTime.getTime() - minutesBefore * 60 * 1000);
  
  // Don't schedule notifications in the past
  if (notificationTime <= new Date()) {
    console.log('Notification time is in the past, not scheduling');
    return null;
  }
  
  // Ensure the notification channel exists on Android
  if (Platform.OS === 'android') {
    await createNotificationChannel(channelId);
  }
  
  // Schedule the notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Show Call Reminder',
      body: `${minutesBefore} minutes until "${showTitle}"`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        showTitle,
        showTime: showTime.toISOString(),
        minutesBefore,
      },
    },
    trigger: {
      date: notificationTime,
    },
  });
  
  console.log(`Scheduled notification ${notificationId} for ${notificationTime}`);
  return notificationId;
}

// Create notification channel (Android only)
async function createNotificationChannel(channelId: string): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: 'Show Calls',
      description: 'Notifications for upcoming show calls',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: true,
    });
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  console.log(`Cancelled notification: ${notificationId}`);
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all scheduled notifications');
}

// Register for push notifications (returns Expo push token)
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Check if device is supported
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }
    
    // Check permissions
    const permissionGranted = await requestNotificationPermissions();
    if (!permissionGranted) {
      console.log('Notification permissions not granted');
      return null;
    }
    
    // Get Expo push token
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    
    console.log('Expo push token:', token);
    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}