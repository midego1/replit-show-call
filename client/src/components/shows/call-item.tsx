import { useState } from "react";
import { CallItemProps } from "@/lib/types";
import { sendNotification } from "@/lib/utils";
import { EditCallForm } from "@/components/shows/edit-call-form";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon, MoreVerticalIcon, XCircleIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function CallItem({ call, number }: CallItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  
  // Delete call mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/calls/${call.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
    },
  });
  
  const handleNotification = () => {
    const groupText = call.groupNames && call.groupNames.length > 0 
      ? `${call.groupNames.join(', ')} Call`
      : 'Call';
      
    sendNotification(`${groupText}: ${call.title || 'Call Time'}`, {
      body: call.description ? call.description : "Time to prepare! Your call is now.",
      icon: "/favicon.ico"
    });
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
                <span className="text-gray-900 font-medium">{call.title || 'Untitled Call'}</span>
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
            <div className="flex space-x-1 mr-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-red-500 hover:bg-red-50 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(e);
                }}
                title="Delete call"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-right">
              {call.timerString ? (
                call.timerString === "00:00" ? (
                  <span className="text-sm font-medium text-red-500">Now</span>
                ) : call.minutesBefore <= 15 ? (
                  <span className="text-sm font-medium text-orange-500">{call.timerString}</span>
                ) : (
                  <span className="text-sm font-medium text-primary">{call.timerString}</span>
                )
              ) : (
                <span className="text-sm font-medium text-gray-500">Time not set</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
