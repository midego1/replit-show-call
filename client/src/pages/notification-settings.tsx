import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellIcon, ArrowLeftIcon, CheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { requestNotificationPermission, sendNotification, isIOS, isNotificationsSupported } from "@/lib/utils";

// Create a type that includes all possible status values explicitly
type NotificationStatusType = "granted" | "denied" | "default" | "unsupported";

export default function NotificationSettings() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationStatusType>("default");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get current notification permission on mount
  useEffect(() => {
    if (!isNotificationsSupported()) {
      setPermissionStatus("unsupported");
      return;
    }
    
    setPermissionStatus(Notification.permission);
    setNotificationsEnabled(Notification.permission === "granted");
  }, []);

  const handleRequestPermission = async () => {
    if (!isNotificationsSupported()) {
      const message = isIOS() 
        ? "iOS Safari doesn't support web notifications. Try using Chrome or Firefox on desktop."
        : "Notifications are not supported by your browser.";
      
      toast({
        title: "Not supported",
        description: message,
        variant: "destructive",
      });
      return;
    }

    try {
      const granted = await requestNotificationPermission();
      setPermissionStatus(Notification.permission);
      setNotificationsEnabled(granted);
      
      if (granted) {
        toast({
          title: "Notifications enabled",
          description: "You will now receive notifications for call times.",
        });
      } else {
        toast({
          title: "Notifications disabled",
          description: "You won't receive automatic notifications for call times.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not request notification permission.",
        variant: "destructive",
      });
    }
  };

  const handleSendTestNotification = () => {
    if (!isNotificationsSupported()) {
      const message = isIOS() 
        ? "iOS Safari doesn't support web notifications. Try using Chrome or Firefox on desktop."
        : "Notifications are not supported by your browser.";
      
      toast({
        title: "Not supported",
        description: message,
        variant: "destructive",
      });
      return;
    }
    
    if (Notification.permission !== "granted") {
      toast({
        title: "Notifications not enabled",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
      return;
    }
    
    sendNotification("Test Notification", {
      body: "This is a test notification from Show Caller. If you see this, notifications are working properly!",
      icon: "/favicon.ico"
    });
    
    toast({
      title: "Test notification sent",
      description: "If you didn't see the notification, please check your system settings.",
    });
  };

  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => setLocation("/profile")}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">Notification Settings</h2>
      </div>

      {isIOS() && (
        <Card className="mb-6 shadow-sm border-orange-200">
          <CardHeader className="px-4 py-3 bg-orange-50 border-b border-orange-200">
            <h3 className="font-medium flex items-center text-orange-700">
              <BellIcon className="mr-2 h-5 w-5" />
              iOS Not Supported
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm">
              iOS Safari doesn't support web notifications. To receive call notifications, 
              please use Chrome or Firefox on a desktop computer.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 shadow-sm">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium flex items-center">
            <BellIcon className="mr-2 h-5 w-5 text-gray-500" />
            Notifications
          </h3>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Status</h4>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {permissionStatus === "granted" ? "Enabled" : 
                   permissionStatus === "denied" ? "Blocked" : 
                   permissionStatus === "unsupported" ? "Unsupported" : "Disabled"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {permissionStatus === "granted" ? "You will receive call notifications." : 
                   permissionStatus === "denied" ? "Please enable notifications in your browser settings." : 
                   permissionStatus === "unsupported" ? "Your browser doesn't support notifications." : 
                   "Enable notifications to get alerts when call times are due."}
                </p>
              </div>
              {permissionStatus === "granted" && (
                <div className="bg-green-100 text-green-600 rounded-full p-1">
                  <CheckIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="enable-notifications" className="cursor-pointer flex-grow">
                <div className="font-medium">Enable Notifications</div>
                <p className="text-sm text-gray-500">Receive alerts when call times are due.</p>
              </Label>
              
              {/* Render switch when permission is granted or default */}
              {permissionStatus === "granted" && (
                <Switch 
                  id="enable-notifications" 
                  checked={true}
                  onCheckedChange={() => handleRequestPermission()}
                />
              )}
              
              {permissionStatus === "default" && (
                <Switch 
                  id="enable-notifications" 
                  checked={false}
                  onCheckedChange={() => handleRequestPermission()}
                />
              )}
              
              {/* Render button for denied and unsupported states */}
              {permissionStatus === "denied" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleRequestPermission()}
                  disabled={true}
                >
                  Blocked
                </Button>
              )}
              
              {permissionStatus === "unsupported" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={true}
                >
                  Not Available
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSendTestNotification}
              disabled={permissionStatus !== "granted"}
            >
              <BellIcon className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-sm">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Notification Settings</h3>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-500 text-sm">
            You can control notification settings for each call when you create or edit it.
            Go to a specific call and toggle the "Send Notification" option to enable or disable
            notifications for that call.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}