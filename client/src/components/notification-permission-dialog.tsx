import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { BellIcon } from "lucide-react";
import { requestNotificationPermission } from "@/lib/utils";

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted: () => void;
}

export function NotificationPermissionDialog({
  open,
  onOpenChange,
  onPermissionGranted
}: NotificationPermissionDialogProps) {
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onPermissionGranted();
    }
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Enable Notifications</DialogTitle>
        </DialogHeader>
        
        <div className="text-center my-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-10 mb-4">
            <BellIcon className="h-8 w-8 text-primary" />
          </div>
          <DialogDescription className="text-lg font-medium mb-2">
            Stay on top of your calls
          </DialogDescription>
          <p className="text-gray-500">
            Show Caller needs permission to send you notifications when your calls are due.
          </p>
        </div>
        
        <DialogFooter className="flex justify-center pt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
          >
            Not Now
          </Button>
          <Button 
            variant="default"
            onClick={handleRequestPermission}
          >
            Allow Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
