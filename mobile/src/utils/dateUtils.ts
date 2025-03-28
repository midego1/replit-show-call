/**
 * Formats a date string into a readable format: "Mon, Jan 1, 2023"
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date string into time format: "7:30 PM"
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates and formats the time remaining until a date
 * @param dateString ISO date string to calculate time remaining until
 * @returns Formatted time remaining string (e.g., "2h 30m", "1d 5h", etc.)
 */
export function getTimeRemaining(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();
  
  // If the date is in the past, return "Past"
  if (targetDate < now) {
    return 'Past';
  }
  
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    // If more than a day away, show days and hours
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    // If more than an hour away, show hours and minutes
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    // If less than an hour away, show minutes
    return `${diffMinutes}m`;
  }
}

/**
 * Calculates the time for a call based on show start time and minutes before
 * @param showTime ISO date string of the show's start time
 * @param minutesBefore Number of minutes before the show when the call is scheduled
 * @returns Date object representing the call time
 */
export function calculateCallTime(showTime: string, minutesBefore: number): Date {
  const showDate = new Date(showTime);
  return new Date(showDate.getTime() - minutesBefore * 60 * 1000);
}

/**
 * Determines if a date is today
 * @param dateString ISO date string to check
 * @returns Boolean indicating if the date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Gets the color for a time remaining display
 * @param timeRemaining Time remaining in milliseconds
 * @returns Color string based on urgency
 */
export function getTimeRemainingColor(timeRemaining: number): string {
  // Convert to hours
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) {
    // Past
    return "#757575"; // Gray
  } else if (hoursRemaining < 0.5) {
    // Less than 30 minutes
    return "#B00020"; // Error/Red
  } else if (hoursRemaining < 2) {
    // Less than 2 hours
    return "#FF8F00"; // Warning/Orange
  } else {
    // More than 2 hours
    return "#03DAC6"; // Info/Teal
  }
}