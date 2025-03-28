import { useState } from "react";
import { CallItemProps } from "@/lib/types";
import { sendNotification, requestNotificationPermission } from "@/lib/utils";
import { EditCallForm } from "@/components/shows/edit-call-form";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2Icon, BellIcon, BellRingIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CallItem({ call, number }: CallItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Delete call mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/calls/${call.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    },
  });
  
  const handleSendNotification = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the edit form
    setIsSendingNotification(true);
    
    try {
      // Request permission first
      const isPermissionGranted = await requestNotificationPermission();
      
      if (!isPermissionGranted) {
        toast({
          title: "Permission denied",
          description: "You need to grant notification permission to send notifications.",
          variant: "destructive"
        });
        return;
      }
      
      // Format groups for the notification
      const groupText = call.groupNames && call.groupNames.length > 0 
        ? `${call.groupNames.join(', ')} Call`
        : 'Call';
        
      // Send the notification
      sendNotification(`${groupText}: ${call.title || 'Call Time'}`, {
        body: call.description 
          ? call.description 
          : `Time for ${groupText}! Please prepare for the show.`,
        icon: "/favicon.ico"
      });
      
      // Show success toast
      toast({
        title: "Notification sent",
        description: `Notification sent to ${call.groupNames?.join(', ') || 'all groups'}.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error sending notification",
        description: "There was a problem sending the notification.",
        variant: "destructive"
      });
      console.error("Notification error:", error);
    } finally {
      setIsSendingNotification(false);
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${call.title || 'Untitled Call'}"?`)) {
      deleteMutation.mutate();
    }
  };
  
  const handleEditComplete = () => {
    setIsEditing(false);
  };
  
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {isEditing ? (
        <EditCallForm
          call={call}
          onComplete={handleEditComplete}
          onCancel={handleEditCancel}
          onDelete={(id) => {
            deleteMutation.mutate();
          }}
        />
      ) : (
        <div 
          className="flex items-center py-3 px-3 cursor-pointer relative hover:bg-gray-50 transition-colors"
          onClick={toggleEdit}
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-medium mr-3">
            {number.toString().padStart(2, "0")}
          </div>
          <div className="flex-grow">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-gray-900 font-medium">
                  {call.title || 'Untitled Call'}
                  {call.sendNotification === 1 && (
                    <span
                      className="inline-flex items-center ml-2 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
                      title="Auto-notification enabled"
                    >
                      <BellIcon className="h-3 w-3 mr-0.5" />
                      Auto
                    </span>
                  )}
                </span>
                <div className="flex flex-wrap gap-1 ml-2">
                  {call.groupNames && call.groupNames.map((groupName, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {groupName}
                    </span>
                  ))}
                </div>
              </div>
              {call.description && (
                <span className="text-gray-500 text-sm mt-1">{call.description}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-primary opacity-70 hover:opacity-100 transition-opacity"
                      onClick={handleSendNotification}
                      disabled={isSendingNotification}
                    >
                      {isSendingNotification ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <BellRingIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send notification to selected groups</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="text-right whitespace-nowrap">
              {call.timerString ? (
                call.timerString === "00:00" ? (
                  <span className="text-sm font-semibold bg-red-100 text-red-500 px-2 py-1 rounded-md">
                    Now
                  </span>
                ) : call.minutesBefore <= 15 ? (
                  <span className="text-sm font-semibold bg-orange-100 text-orange-500 px-2 py-1 rounded-md">
                    {call.timerString.replace(":", "h ")}m until call
                  </span>
                ) : (
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md">
                    {call.timerString.replace(":", "h ")}m until call
                  </span>
                )
              ) : (
                <span className="text-sm font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                  Time not set
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
