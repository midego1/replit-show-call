import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShowCard } from "@/components/shows/show-card";
import { Show, Call, Group } from "@shared/schema";
import { ShowWithDetails, CallWithDetails } from "@/lib/types";
import { formatTimeRemaining, formatShowDate, formatTimerString, calculateTimeRemaining, sendNotification } from "@/lib/utils";

export default function Home() {
  const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
  const notifiedCallsRef = useRef<Set<number>>(new Set());
  
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
  
  // Check for calls that need notifications
  useEffect(() => {
    if (!shows.length || !allCalls.length || !allGroups.length) return;
    
    const checkCallTimes = () => {
      shows.forEach(show => {
        const showStartTime = new Date(show.startTime);
        const calls = allCalls.filter(call => call.showId === show.id);
        
        calls.forEach(call => {
          // Skip if we've already notified for this call
          if (notifiedCallsRef.current.has(call.id)) return;
          
          const timeRemainingMs = calculateTimeRemaining(showStartTime, call.minutesBefore);
          
          // If time is up and we haven't notified yet
          if (timeRemainingMs <= 0) {
            // Get group names for this call
            const groupIdsArray = typeof call.groupIds === 'string'
              ? JSON.parse(call.groupIds as string)
              : (call.groupIds || []);
            
            const relevantGroups = allGroups.filter(
              group => (group.isCustom === 0 || group.showId === show.id)
            );
            
            const groupNames = relevantGroups
              .filter(g => groupIdsArray && Array.isArray(groupIdsArray) && groupIdsArray.includes(g.id))
              .map(g => g.name);
            
            const groupText = groupNames.length > 0 
              ? `${groupNames.join(', ')} Call`
              : 'Call';
              
            sendNotification(`${groupText}: ${call.title || 'Call Time'}`, {
              body: call.description ? call.description : "Time to prepare! Your call is now.",
              icon: "/favicon.ico"
            });
            
            // Mark as notified
            notifiedCallsRef.current.add(call.id);
          }
        });
      });
    };
    
    // Check immediately
    checkCallTimes();
    
    // Set interval to check every 5 seconds
    const interval = setInterval(checkCallTimes, 5000);
    return () => clearInterval(interval);
  }, [shows, allCalls, allGroups]);
  
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
            
            // Get relevant groups (includes default groups)
            const showGroups = allGroups.filter(
              group => group.isCustom === 0 || group.showId === show.id
            );
            
            // Process calls with numbers and group names
            const processedCalls: CallWithDetails[] = calls.map((call, idx) => {
              // Process groupIds from string to array if needed
              const groupIdsArray = typeof call.groupIds === 'string'
                ? JSON.parse(call.groupIds as string)
                : (call.groupIds || []);
              
              // Get all group names for this call
              const groupNames = showGroups
                .filter(g => groupIdsArray && Array.isArray(groupIdsArray) && groupIdsArray.includes(g.id))
                .map(g => g.name);
              
              // Keep groupName for backward compatibility
              const groupName = groupNames.length > 0 ? groupNames[0] : '';
              
              // Calculate time remaining for this call
              const showStartTime = new Date(show.startTime);
              const timeRemainingMs = calculateTimeRemaining(showStartTime, call.minutesBefore);
              const timerString = formatTimerString(timeRemainingMs);
              
              return {
                ...call,
                number: idx + 1,
                groupName,
                groupNames,
                timerString
              };
            }).sort((a, b) => b.minutesBefore - a.minutesBefore);
            
            return (
              <ShowCard
                key={show.id}
                show={show}
                calls={processedCalls}
                groups={showGroups}
                expanded={expandedShowId === show.id}
                onToggleExpand={handleToggleExpand}
                onAddCall={handleAddCall}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
