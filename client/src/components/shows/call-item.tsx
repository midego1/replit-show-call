import { CallItemProps } from "@/lib/types";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { sendNotification } from "@/lib/utils";

export function CallItem({ call, number }: CallItemProps) {
  const handleNotification = () => {
    const groupText = call.groupNames && call.groupNames.length > 0 
      ? `${call.groupNames.join(', ')} Call`
      : 'Call';
      
    sendNotification(`${groupText}: ${call.description}`, {
      body: "Time to prepare! Your call is now.",
      icon: "/favicon.ico"
    });
  };

  return (
    <div className="flex items-center py-3 px-3 border-b border-gray-200 last:border-b-0">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-medium mr-3">
        {number.toString().padStart(2, "0")}
      </div>
      <div className="flex-grow">
        <div className="flex items-center">
          <span className="text-gray-900 font-medium">{call.description}</span>
          <div className="flex flex-wrap gap-1 ml-2">
            {call.groupNames && call.groupNames.map((groupName, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {groupName}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right">
        {call.showId && (
          <CountdownTimer
            startTime={new Date(call.showId)}
            minutesBefore={call.minutesBefore}
            onComplete={handleNotification}
          />
        )}
      </div>
    </div>
  );
}
