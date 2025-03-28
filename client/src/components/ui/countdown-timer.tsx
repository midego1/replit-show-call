import { useState, useEffect } from "react";
import { formatTimerString } from "@/lib/utils";

interface CountdownTimerProps {
  startTime: Date;
  minutesBefore: number;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({ 
  startTime, 
  minutesBefore, 
  onComplete,
  className = ""
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  // Calculate the target time
  const calculateTargetTime = () => {
    const targetTime = new Date(startTime);
    targetTime.setMinutes(targetTime.getMinutes() - minutesBefore);
    return targetTime;
  };
  
  // Calculate time remaining in milliseconds
  const getTimeRemaining = () => {
    const now = new Date();
    const targetTime = calculateTargetTime();
    return Math.max(0, targetTime.getTime() - now.getTime());
  };
  
  useEffect(() => {
    const updateTimer = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && onComplete) {
        onComplete();
      }
    };
    
    // Initial calculation
    updateTimer();
    
    // Update every second
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, minutesBefore, onComplete]);
  
  return (
    <div className={`font-medium text-primary ${className}`}>
      {formatTimerString(timeRemaining)}
    </div>
  );
}
