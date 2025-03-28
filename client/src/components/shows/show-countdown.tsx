import { useState, useEffect } from "react";
import { Show } from "@shared/schema";

interface ShowCountdownProps {
  show: Show;
  className?: string;
}

export function ShowCountdown({ show, className = "" }: ShowCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const showTime = new Date(show.startTime);
      
      // Calculate the difference in milliseconds
      const diff = Math.max(0, showTime.getTime() - now.getTime());
      
      // Convert to hours and minutes
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format the time
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    // Initial calculation
    updateTimer();
    
    // Update every minute
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [show.startTime]);
  
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
        {timeRemaining} until show
      </span>
    </div>
  );
}