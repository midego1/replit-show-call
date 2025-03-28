import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShowCard } from "@/components/shows/show-card";
import { CreateCallDialog } from "@/components/shows/create-call-dialog";
import { CreateShowDialog } from "@/components/shows/create-show-dialog";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Show, Call, Group } from "@shared/schema";
import { ShowWithDetails, CallWithDetails } from "@/lib/types";
import { formatTimeRemaining, formatShowDate, calculateTimeRemaining } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [expandedShowId, setExpandedShowId] = useState<number | null>(null);
  const [showCreateShowDialog, setShowCreateShowDialog] = useState(false);
  const [showCreateCallDialog, setShowCreateCallDialog] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);
  
  // Fetch shows
  const { data: shows = [], isLoading: isLoadingShows } = useQuery<Show[]>({
    queryKey: ['/api/shows'],
  });
  
  // Map calls to shows
  const callQueries = shows.map(show => {
    return useQuery<Call[]>({
      queryKey: [`/api/shows/${show.id}/calls`],
      enabled: !!show.id
    });
  });
  
  // Map groups to shows
  const groupQueries = shows.map(show => {
    return useQuery<Group[]>({
      queryKey: [`/api/shows/${show.id}/groups`],
      enabled: !!show.id
    });
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
  
  // Handle add call
  const handleAddCall = (showId: number) => {
    setSelectedShowId(showId);
    setShowCreateCallDialog(true);
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
      
      {/* Empty State */}
      {processedShows.length === 0 && !isLoadingShows ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No upcoming calls</h3>
          <p className="text-gray-500 mb-4">Add your first show to get started</p>
          <Button
            onClick={() => setShowCreateShowDialog(true)}
            className="rounded-full px-6"
          >
            Create Show
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {processedShows.map((show, index) => {
            const callsQuery = callQueries[index];
            const groupsQuery = groupQueries[index];
            
            const calls = callsQuery.data || [];
            const groups = groupsQuery.data || [];
            
            // Process calls with numbers and calculated time remaining
            const processedCalls: CallWithDetails[] = calls.map((call, idx) => {
              const groupName = groups.find(g => g.id === call.groupId)?.name;
              
              return {
                ...call,
                number: idx + 1,
                groupName
              };
            }).sort((a, b) => b.minutesBefore - a.minutesBefore);
            
            return (
              <ShowCard
                key={show.id}
                show={show}
                calls={processedCalls}
                groups={groups}
                expanded={expandedShowId === show.id}
                onToggleExpand={handleToggleExpand}
                onAddCall={handleAddCall}
              />
            );
          })}
        </div>
      )}
      
      <FloatingActionButton onClick={() => setShowCreateShowDialog(true)} />
      
      <CreateShowDialog
        open={showCreateShowDialog}
        onOpenChange={setShowCreateShowDialog}
      />
      
      <CreateCallDialog
        open={showCreateCallDialog}
        onOpenChange={setShowCreateCallDialog}
        showId={selectedShowId}
      />
    </div>
  );
}
