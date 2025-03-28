import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  UserIcon, 
  BellIcon, 
  KeyIcon, 
  HelpCircleIcon, 
  MessageSquareIcon, 
  LogOutIcon, 
  ChevronRightIcon,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  
  // Get initials from username for the avatar
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-block rounded-full bg-primary text-white w-20 h-20 flex items-center justify-center text-2xl font-medium mb-4">
          {user ? getInitials(user.username) : <Loader2 className="animate-spin" />}
        </div>
        <h2 className="text-xl font-medium">{user?.username || "Loading..."}</h2>
      </div>

      <Card className="mb-6 shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Account Settings</h3>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            <li>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UserIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Edit Profile</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <BellIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Notification Settings</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <KeyIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Change Password</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Help & Support</h3>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            <li>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <HelpCircleIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span>FAQs</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full flex items-center justify-between px-4 py-3 text-gray-900 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <MessageSquareIcon className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Contact Support</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Button 
        variant="destructive" 
        className="w-full py-3 rounded-lg"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <LogOutIcon className="mr-2 h-5 w-5" />
        )}
        {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
      </Button>
    </div>
  );
}
