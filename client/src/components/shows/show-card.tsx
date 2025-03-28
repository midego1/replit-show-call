import { useState, useCallback } from "react";
import { ShowCardProps } from "@/lib/types";
import { CallItem } from "@/components/shows/call-item";
import { InlineCallForm } from "@/components/shows/inline-call-form";
import { ShowCountdown } from "@/components/shows/show-countdown";
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  CalendarIcon,
  SettingsIcon,
  PlusCircleIcon,
  XIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ShowCard({ 
  show, 
  calls, 
  groups,
  expanded, 
  onToggleExpand,
  onAddCall
}: ShowCardProps) {
  const [showInlineForm, setShowInlineForm] = useState(false);
  
  const handleAddCall = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion toggle
    setShowInlineForm(true);
  };
  
  const handleFormComplete = () => {
    setShowInlineForm(false);
  };
  
  const handleFormCancel = () => {
    setShowInlineForm(false);
  };
  
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader 
        className="px-5 py-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onToggleExpand(show.id)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{show.name}</h3>
            <p className="text-sm text-gray-500">{show.description}</p>
          </div>
          <div>
            {expanded ? 
              <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : 
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            }
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{show.formattedDate} {show.formattedTime}</span>
          </div>
          <ShowCountdown show={show} />
        </div>
      </CardHeader>
      
      {expanded && (
        <>
          {/* Action Bar */}
          <div className="flex border-t border-b border-gray-200 overflow-x-auto">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-none py-3 text-gray-500 hover:text-primary hover:bg-gray-50"
              onClick={handleAddCall}
            >
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Add Call</span>
            </Button>
            <Button variant="ghost" className="flex-1 rounded-none py-3 text-gray-500 hover:text-primary hover:bg-gray-50">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="ghost" className="flex-1 rounded-none py-3 text-gray-500 hover:text-primary hover:bg-gray-50">
              <ClockIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">History</span>
            </Button>
            <Button variant="ghost" className="flex-1 rounded-none py-3 text-gray-500 hover:text-primary hover:bg-gray-50">
              <UsersIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Calibre</span>
            </Button>
            <Button variant="ghost" className="flex-1 rounded-none py-3 text-gray-500 hover:text-primary hover:bg-gray-50">
              <FileTextIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Notes</span>
            </Button>
          </div>
          
          {/* Inline Add Call Form */}
          {showInlineForm && (
            <InlineCallForm 
              showId={show.id} 
              onComplete={handleFormComplete} 
              onCancel={handleFormCancel} 
            />
          )}
          
          {/* Calls List */}
          <CardContent className="px-2 py-1 bg-gray-50">
            {calls.length > 0 ? (
              calls.map((call, index) => (
                <CallItem 
                  key={call.id} 
                  call={call} 
                  number={index + 1} 
                />
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                <p>No calls added yet</p>
                <Button 
                  variant="link" 
                  onClick={handleAddCall}
                  className="text-primary mt-2"
                >
                  Add your first call
                </Button>
              </div>
            )}
          </CardContent>
          
          {/* Preferences */}
          <CardFooter className="px-3 py-3 flex justify-between items-center border-t border-gray-200 mt-1 bg-gray-50">
            <div className="flex items-center text-gray-500">
              <SettingsIcon className="w-5 h-5 mr-2" />
              <span>Preferences</span>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          </CardFooter>
        </>
      )}
    </Card>
  );
}

// Import these icons at the top of the file
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
