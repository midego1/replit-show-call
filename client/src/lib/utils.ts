import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistance, format, differenceInMilliseconds } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeRemaining(startTime: Date): string {
  const now = new Date();
  if (startTime < now) return "Starting soon";
  return formatDistance(startTime, now, { addSuffix: false });
}

export function formatShowDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatShowTime(date: Date): string {
  return format(date, "h:mm a");
}

export function formatTimerString(milliseconds: number): string {
  if (milliseconds <= 0) return "00:00";
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function calculateCallTime(showStartTime: Date, minutesBefore: number): Date {
  const callTime = new Date(showStartTime);
  callTime.setMinutes(callTime.getMinutes() - minutesBefore);
  return callTime;
}

export function calculateTimeRemaining(showStartTime: Date, minutesBefore: number): number {
  const callTime = calculateCallTime(showStartTime, minutesBefore);
  const now = new Date();
  return Math.max(0, differenceInMilliseconds(callTime, now));
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return Promise.resolve(false);
  }
  
  if (Notification.permission === "granted") {
    return Promise.resolve(true);
  }
  
  if (Notification.permission === "denied") {
    return Promise.resolve(false);
  }
  
  return Notification.requestPermission().then(permission => {
    return permission === "granted";
  });
}

export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  
  new Notification(title, options);
}

// Helper function to check if it's time to send auto-notifications for calls
export function checkAndSendAutoNotifications(
  calls: any[],
  shows: any[],
  notifiedCallIds: Set<number>,
  setNotifiedCallIds: (callIds: Set<number>) => void
): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  
  const now = new Date();
  
  const callsToNotify = calls.filter(call => {
    // Check if this call has auto-notifications enabled
    if (call.sendNotification !== 1) return false;
    
    // Check if we've already notified for this call
    if (notifiedCallIds.has(call.id)) return false;
    
    // Find the show this call belongs to
    const show = shows.find(s => s.id === call.showId);
    if (!show) return false;
    
    // Calculate when the call time is
    const callTime = calculateCallTime(new Date(show.startTime), call.minutesBefore);
    
    // Check if it's time to send the notification (within 1 minute of call time)
    // This ensures we don't miss notifications if the page wasn't open exactly at call time
    const timeDiff = Math.abs(differenceInMilliseconds(callTime, now));
    return timeDiff < 60000; // Within 1 minute
  });
  
  // Send notifications for each call that qualifies
  callsToNotify.forEach(call => {
    // Parse group IDs
    const groupIds = typeof call.groupIds === 'string' 
      ? JSON.parse(call.groupIds) 
      : call.groupIds;
    
    // Format groups for the notification
    const groupText = call.groupNames && call.groupNames.length > 0 
      ? `${call.groupNames.join(', ')} Call`
      : 'Call';
      
    // Send the notification
    sendNotification(`${groupText}: ${call.title || 'Call Time'}`, {
      body: call.description 
        ? call.description 
        : `Time for ${groupText}! Please prepare for the show.`,
      icon: "/favicon.ico"
    });
    
    // Add to notified set to prevent duplicate notifications
    notifiedCallIds.add(call.id);
  });
  
  // Update the notified calls set if any new notifications were sent
  if (callsToNotify.length > 0) {
    setNotifiedCallIds(new Set(notifiedCallIds));
  }
}
