import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Show } from "@shared/schema";
import { ShowWithDetails } from "@/lib/types";
import { formatShowDate, formatShowTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon, CalendarIcon, ClockIcon, UsersIcon, PlusIcon } from "lucide-react";
import { CreateShowDialog } from "@/components/shows/create-show-dialog";
import { EditShowDialog } from "@/components/shows/edit-show-dialog";
import { EditShowForm } from "@/components/shows/edit-show-form";
import { InlineShowForm } from "@/components/shows/inline-show-form";
import { FloatingActionButton } from "@/components/floating-action-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Shows() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [editingShowId, setEditingShowId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // State to track button clicks to prevent double-taps
  const [isButtonProcessing, setIsButtonProcessing] = useState(false);
  
  // Helper function to handle adding a show with iOS double-tap prevention
  const handleAddShow = useCallback(() => {
    // Prevent double clicks with state tracking
    if (isButtonProcessing) return;
    
    setIsButtonProcessing(true);
    
    // Set timeout to prevent double-taps on iOS
    setTimeout(() => {
      // Always use inline form per user preference
      setShowAddForm(true);
      setIsButtonProcessing(false);
    }, 100);
  }, [isButtonProcessing]);
  
  // Fetch shows
  const { data: shows = [] } = useQuery<Show[]>({
    queryKey: ['/api/shows'],
  });
  
  // Fetch all calls for call count
  const { data: allCalls = [] } = useQuery<any[]>({
    queryKey: ['/api/calls'],
    enabled: shows.length > 0,
  });
  
  // Process shows
  const processedShows: ShowWithDetails[] = shows.map(show => {
    const startTime = new Date(show.startTime);
    return {
      ...show,
      formattedDate: formatShowDate(startTime),
      formattedTime: formatShowTime(startTime)
    };
  }).sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  // Delete show mutation
  const deleteShow = useMutation({
    mutationFn: async (showId: number) => {
      await apiRequest("DELETE", `/api/shows/${showId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      toast({
        title: "Show deleted",
        description: "The show has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete show: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDeleteShow = (showId: number, showName: string) => {
    if (confirm(`Are you sure you want to delete "${showName}"? This cannot be undone.`)) {
      deleteShow.mutate(showId);
    }
  };
  
  const handleEditShow = (show: Show) => {
    // For dialog editing
    setSelectedShow(show);
    setShowEditDialog(true);
  };
  
  const handleInlineEdit = (show: Show) => {
    setEditingShowId(show.id);
  };
  
  const handleInlineEditComplete = () => {
    setEditingShowId(null);
  };
  
  const handleInlineDelete = (id: number) => {
    deleteShow.mutate(id);
    setEditingShowId(null);
  };
  
  // Count calls for a specific show
  const getCallCount = (showId: number) => {
    return allCalls.filter(call => call.showId === showId).length;
  };
  
  // Render a show card
  const renderShowCard = (show: ShowWithDetails) => {
    const isEditing = editingShowId === show.id;
    
    return (
      <Card key={show.id} className="shadow-sm">
        <CardContent 
          className={`p-4 ${!isEditing ? 'hover:bg-gray-50 transition-colors cursor-pointer' : ''}`} 
          onClick={() => !isEditing && handleInlineEdit(show)}
        >
          {isEditing ? (
            <EditShowForm 
              show={show} 
              onComplete={handleInlineEditComplete}
              onCancel={handleInlineEditComplete}
              onDelete={handleInlineDelete}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-2 group">
                <h3 className="text-lg font-medium group-hover:text-primary">{show.name}</h3>
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInlineEdit(show);
                    }}
                    title="Edit show"
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShow(show.id, show.name);
                    }}
                    disabled={deleteShow.isPending}
                    title="Delete show"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{show.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>{show.formattedDate}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{show.formattedTime}</span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1" />
                  <span>{getCallCount(show.id)} calls</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      
      {processedShows.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No shows yet</h3>
          <p className="text-gray-500 mb-4">Create your first show to get started</p>
          <button
            onClick={handleAddShow}
            disabled={isButtonProcessing}
            type="button"
            style={{
              backgroundColor: isButtonProcessing ? 'var(--primary-light)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isButtonProcessing ? 'not-allowed' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              minHeight: '44px',
              width: '160px',
              transition: 'background-color 0.2s'
            }}
          >
            {isButtonProcessing ? 'Processing...' : 'Create Show'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {showAddForm && (
            <Card className="shadow-sm border-primary/20">
              <CardContent className="p-4">
                <InlineShowForm 
                  onComplete={() => setShowAddForm(false)}
                  onCancel={() => setShowAddForm(false)}
                />
              </CardContent>
            </Card>
          )}
          
          {!showAddForm && (
            <button 
              className="w-full mb-4 py-3 border border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white hover:bg-gray-50 text-gray-500"
              style={{
                cursor: isButtonProcessing ? 'not-allowed' : 'pointer',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                minHeight: '50px',
                opacity: isButtonProcessing ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
              onClick={handleAddShow}
              disabled={isButtonProcessing}
              type="button"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>Add New Show</span>
            </button>
          )}
          
          {processedShows.map(renderShowCard)}
        </div>
      )}
      
      <FloatingActionButton 
        onClick={handleAddShow}
      />
      
      <CreateShowDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <EditShowDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        show={selectedShow}
      />
    </div>
  );
}