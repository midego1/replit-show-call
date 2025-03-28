import { CallItemProps } from "@/lib/types";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { sendNotification } from "@/lib/utils";

export function CallItem({ call, number }: CallItemProps) {
  const handleNotification = () => {
    sendNotification(`${call.groupName} Call: ${call.description}`, {
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
          {call.groupName && (
            <span className="ml-2 text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded">
              {call.groupName}
            </span>
          )}
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
