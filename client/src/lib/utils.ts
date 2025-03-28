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
  if (milliseconds <= 0) return "0:00";
  
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

export function isIOS(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isNotificationsSupported(): boolean {
  return "Notification" in window;
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsSupported()) {
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
  // Play notification sound regardless of notification method
  playNotificationSound();
  
  // First try native Notifications if supported and permission granted
  if (isNotificationsSupported() && Notification.permission === "granted") {
    new Notification(title, options);
    return;
  }
  
  // For iOS, we'll create an in-app notification as fallback
  if (isIOS()) {
    // Create an in-app notification that appears at the top of the screen
    createInAppNotification(title, options?.body || "");
  }
}

// Play notification sound
export function playNotificationSound(): void {
  try {
    // Create a new audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a pleasant notification tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure the sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);
    
    // Connect and start
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.6);
    
    // Play a secondary tone after a short delay
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(1100, audioContext.currentTime); // C#6 note
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.start();
      oscillator2.stop(audioContext.currentTime + 0.4);
    }, 150);
  } catch (error) {
    console.error("Could not play notification sound:", error);
  }
}

// Helper function to create an in-app notification for iOS and other platforms
// that don't support the Notifications API
function createInAppNotification(title: string, body: string): void {
  // Create elements
  const notificationEl = document.createElement("div");
  const titleEl = document.createElement("div");
  const bodyEl = document.createElement("div");
  const closeEl = document.createElement("button");
  
  // Set content
  titleEl.textContent = title;
  bodyEl.textContent = body;
  closeEl.textContent = "×";
  
  // Add styles
  notificationEl.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 90%;
    width: 350px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    padding: 12px 16px;
    animation: slideIn 0.3s ease-out;
    border-left: 4px solid #6200EE;
  `;
  
  titleEl.style.cssText = `
    font-weight: bold;
    margin-bottom: 4px;
    padding-right: 24px;
  `;
  
  bodyEl.style.cssText = `
    font-size: 14px;
    color: #666;
  `;
  
  closeEl.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    width: 24px;
    height: 24px;
    line-height: 1;
    padding: 0;
  `;
  
  // Add a simple slide-in animation
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes slideIn {
      from { transform: translate(-50%, -100%); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translate(-50%, 0); opacity: 1; }
      to { transform: translate(-50%, -100%); opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);
  
  // Append elements
  notificationEl.appendChild(titleEl);
  notificationEl.appendChild(bodyEl);
  notificationEl.appendChild(closeEl);
  document.body.appendChild(notificationEl);
  
  // Add event listener to close button
  closeEl.addEventListener('click', () => {
    notificationEl.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      document.body.removeChild(notificationEl);
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notificationEl)) {
      notificationEl.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        if (document.body.contains(notificationEl)) {
          document.body.removeChild(notificationEl);
        }
      }, 300);
    }
  }, 5000);
}

// Helper function to check if it's time to send auto-notifications for calls
export function checkAndSendAutoNotifications(
  calls: any[],
  shows: any[],
  notifiedCallIds: Set<number>,
  setNotifiedCallIds: (callIds: Set<number>) => void
): void {
  // On iOS, we can always send in-app notifications
  // On other platforms, we need notification permission
  if (!isIOS() && (!isNotificationsSupported() || Notification.permission !== "granted")) {
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
    // Prepare notification content
    const notificationTitle = call.title || 'Call Time';
    sendNotification(notificationTitle, {
      body: call.description 
        ? call.description 
        : `Time for call! Please prepare for the show.`,
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
