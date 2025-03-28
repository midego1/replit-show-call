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
