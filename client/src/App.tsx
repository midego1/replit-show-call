import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Shows from "@/pages/shows";
import Groups from "@/pages/groups";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { NotificationPermissionDialog } from "@/components/notification-permission-dialog";
import { TabOption } from "@/lib/types";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const [activeTab, setActiveTab] = useState<TabOption>("home");
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // Wait a bit before showing the prompt
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle permission granted
  const handlePermissionGranted = () => {
    console.log("Notification permission granted");
  };

  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="pb-16 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex items-center justify-center px-4 h-14">
          <h1 className="text-xl font-semibold">Show Caller</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mt-14 mb-16">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.location.href = tab === "home" ? "/" : `/${tab}`;
        }}
      />
      
      {/* Notification Permission Dialog */}
      <NotificationPermissionDialog
        open={showNotificationPrompt}
        onOpenChange={setShowNotificationPrompt}
        onPermissionGranted={handlePermissionGranted}
      />
    </div>
  );

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={() => {
        setActiveTab("home");
        return (
          <AuthenticatedLayout>
            <Home />
          </AuthenticatedLayout>
        );
      }} />
      
      <ProtectedRoute path="/shows" component={() => {
        setActiveTab("shows");
        return (
          <AuthenticatedLayout>
            <Shows />
          </AuthenticatedLayout>
        );
      }} />
      
      <ProtectedRoute path="/groups" component={() => {
        setActiveTab("groups");
        return (
          <AuthenticatedLayout>
            <Groups />
          </AuthenticatedLayout>
        );
      }} />
      
      <ProtectedRoute path="/profile" component={() => {
        setActiveTab("profile");
        return (
          <AuthenticatedLayout>
            <Profile />
          </AuthenticatedLayout>
        );
      }} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Import these icons at the top of the file
function BellIcon(props: any) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SettingsIcon(props: any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default App;
