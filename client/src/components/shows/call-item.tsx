import { useState } from "react";
import { CallItemProps } from "@/lib/types";
import { sendNotification } from "@/lib/utils";
import { EditCallForm } from "@/components/shows/edit-call-form";
import { Button } from "@/components/ui/button";
import { Edit2Icon } from "lucide-react";

export function CallItem({ call, number }: CallItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleNotification = () => {
    const groupText = call.groupNames && call.groupNames.length > 0 
      ? `${call.groupNames.join(', ')} Call`
      : 'Call';
      
    sendNotification(`${groupText}: ${call.title || 'Call Time'}`, {
      body: call.description ? call.description : "Time to prepare! Your call is now.",
      icon: "/favicon.ico"
    });
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleEditComplete = () => {
    setIsEditing(false);
  };
  
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      {isEditing ? (
        <EditCallForm
          call={call}
          onComplete={handleEditComplete}
          onCancel={handleEditCancel}
        />
      ) : (
        <div className="flex items-center py-3 px-3 border-b border-gray-200 last:border-b-0 group">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-medium mr-3">
            {number.toString().padStart(2, "0")}
          </div>
          <div className="flex-grow">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-gray-900 font-medium">{call.title || 'Untitled Call'}</span>
                <div className="flex flex-wrap gap-1 ml-2">
                  {call.groupNames && call.groupNames.map((groupName, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
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
            <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-500 hover:text-primary"
                onClick={handleEdit}
              >
                <Edit2Icon className="h-4 w-4" />
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
    </>
  );
}
