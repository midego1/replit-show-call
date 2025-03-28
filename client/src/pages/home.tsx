import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShowCard } from "@/components/shows/show-card";
import { InlineShowForm } from "@/components/shows/inline-show-form";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Show, Call, Group } from "@shared/schema";
import { ShowWithDetails, CallWithDetails } from "@/lib/types";
import { formatTimeRemaining, formatShowDate, calculateTimeRemaining } from "@/lib/utils";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
  const [showInlineShowForm, setShowInlineShowForm] = useState(false);
  
  // Fetch shows
  const { data: shows = [], isLoading: isLoadingShows } = useQuery<Show[]>({
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
  
  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Upcoming Calls</h2>
        <div className="text-sm text-gray-500 flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Show creation section */}
      {!showInlineShowForm && processedShows.length === 0 && !isLoadingShows ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No upcoming calls</h3>
          <p className="text-gray-500 mb-4">Add your first show to get started</p>
          <Button
            onClick={() => setShowInlineShowForm(true)}
            className="rounded-full px-6"
          >
            Create Show
          </Button>
        </div>
      ) : !showInlineShowForm && processedShows.length > 0 ? (
        <div className="mb-6">
          <Button
            onClick={() => setShowInlineShowForm(true)}
            variant="outline"
            className="w-full flex items-center justify-center py-6 border-dashed"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Show
          </Button>
        </div>
      ) : null}
      
      {/* Inline show form */}
      {showInlineShowForm && (
        <InlineShowForm
          onComplete={() => setShowInlineShowForm(false)}
          onCancel={() => setShowInlineShowForm(false)}
        />
      )}
      
      {/* Shows list */}
      <div className="space-y-6">
        {processedShows.map((show) => {
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
            
            return {
              ...call,
              number: idx + 1,
              groupName,
              groupNames
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
        })}
      </div>
      
      {/* We'll keep the FloatingActionButton but change its functionality */}
      <FloatingActionButton onClick={() => setShowInlineShowForm(true)} />
    </div>
  );
}
