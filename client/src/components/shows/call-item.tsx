import { useState } from "react";
import { CallItemProps } from "@/lib/types";
import { EditCallForm } from "@/components/shows/edit-call-form";
import { BellIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CallItem({ call, number }: CallItemProps) {
  const [isEditing, setIsEditing] = useState(false);
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
  // This functionality has been removed and replaced with a checkbox in the edit form
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
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
          className="flex items-start py-3 px-3 cursor-pointer relative hover:bg-gray-50 transition-colors"
          onClick={toggleEdit}
        >
          {/* Removed number indicator as requested */}
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              {/* Left side - Title and description */}
              <div className="flex flex-col">
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
                
                {/* Description directly underneath title */}
                {call.description && (
                  <span className="text-gray-500 text-xs mt-1">{call.description}</span>
                )}
              </div>
              
              {/* Right side - Timer */}
              <div className="flex-shrink-0 ml-3">
                <div className="text-right whitespace-nowrap">
                  {call.timerString ? (
                    call.timerString === "0:00" ? (
                      <span className="text-xs sm:text-sm font-semibold bg-red-100 text-red-500 px-2 py-1 rounded-full">
                        Now
                      </span>
                    ) : call.minutesBefore <= 15 ? (
                      <span className="text-xs sm:text-sm font-semibold bg-orange-100 text-orange-500 px-2 py-1 rounded-full">
                        {call.timerString.replace(":", "h ")}m
                        <span className="hidden sm:inline"> until call</span>
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {call.timerString.replace(":", "h ")}m
                        <span className="hidden sm:inline"> until call</span>
                      </span>
                    )
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      Time not set
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
