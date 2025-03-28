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
