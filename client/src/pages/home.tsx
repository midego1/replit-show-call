import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShowCard } from "@/components/shows/show-card";
import { Show, Call, Group } from "@shared/schema";
import { ShowWithDetails, CallWithDetails } from "@/lib/types";
import { 
  formatTimeRemaining, 
  formatShowDate, 
  formatTimerString, 
  calculateTimeRemaining, 
  sendNotification,
  checkAndSendAutoNotifications,
  requestNotificationPermission
} from "@/lib/utils";
import { useLocation } from "wouter";

export default function Home() {
  const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
  const notifiedCallsRef = useRef<Set<number>>(new Set());
  const [, setLocation] = useLocation();
  
  // Fetch shows
  const { data: shows = [] } = useQuery<Show[]>({
    queryKey: ['/api/shows'],
  });
  
  // Fetch all calls in a single query
  const { data: allCalls = [] } = useQuery<Call[]>({
    queryKey: ['/api/calls'],
    enabled: shows.length > 0,
  });
  
  // Fetch all groups in a single query
  const { data: allGroups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
    enabled: shows.length > 0,
  });
  
  // Process shows with their time remaining
  const processedShows: ShowWithDetails[] = shows.map(show => {
    const startTime = new Date(show.startTime);
    return {
      ...show,
      timeRemaining: formatTimeRemaining(startTime),
      formattedDate: formatShowDate(startTime)
    };
  }).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  // Handle toggle expand
  const handleToggleExpand = (showId: number) => {
    setExpandedShowId(expandedShowId === showId ? null : showId);
  };
  
  // Handle add call - this is now a no-op since the form is inline
  const handleAddCall = (showId: number) => {
    // The ShowCard component now handles this internally
  };
  
  // Set first show expanded by default if there's at least one
  useEffect(() => {
    if (processedShows.length > 0 && expandedShowId === null) {
      setExpandedShowId(processedShows[0].id);
    }
  }, [processedShows, expandedShowId]);
  
  // Request notification permissions when component mounts
  useEffect(() => {
    // Request permission silently on component mount
    requestNotificationPermission().catch(() => {
      // Handle error silently
    });
  }, []);
  
  // Check for calls that need auto-notifications
  useEffect(() => {
    if (!shows.length || !allCalls.length) return;
    
    const checkNotifications = () => {
      // Process calls to ensure they have the proper format
      const processedCalls = allCalls.map(call => {
        // Find the show this call belongs to
        const show = shows.find(s => s.id === call.showId);
        if (!show) return call;
        
        // Keep a simple version without group data (groups functionality has been removed)
        return {
          ...call
        };
      });
      
      // Use our utility function to check and send notifications
      checkAndSendAutoNotifications(
        processedCalls,
        shows,
        notifiedCallsRef.current,
        (newSet) => {
          notifiedCallsRef.current = newSet;
        }
      );
    };
    
    // Check immediately
    checkNotifications();
    
    // Set interval to check every 10 seconds
    const interval = setInterval(checkNotifications, 10000);
    return () => clearInterval(interval);
  }, [shows, allCalls]);
  
  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      
      {/* Shows list */}
      <div className="space-y-6">
        {processedShows.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No shows yet</h3>
            <p className="text-gray-500">Go to Shows tab to create shows</p>
          </div>
        ) : (
          processedShows.map((show) => {
            // Filter calls for this show
            const calls = allCalls.filter(call => call.showId === show.id);
            
            // Process calls with numbers and timer information
            const processedCalls: CallWithDetails[] = calls.map((call, idx) => {
              // Calculate time remaining for this call
              const showStartTime = new Date(show.startTime);
              const timeRemainingMs = calculateTimeRemaining(showStartTime, call.minutesBefore);
              const timerString = formatTimerString(timeRemainingMs);
              
              return {
                ...call,
                number: idx + 1,
                timerString
              };
            }).sort((a, b) => b.minutesBefore - a.minutesBefore);
            
            return (
              <ShowCard
                key={show.id}
                show={show}
                calls={processedCalls}
                expanded={expandedShowId === show.id}
                onToggleExpand={() => handleToggleExpand(show.id)}
                onAddCall={handleAddCall}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
