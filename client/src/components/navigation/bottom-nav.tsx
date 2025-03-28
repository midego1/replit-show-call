import { HomeIcon, ClipboardListIcon, UsersIcon, UserIcon } from "lucide-react";
import { TabOption } from "@/lib/types";

interface BottomNavProps {
  activeTab: TabOption;
  onTabChange: (tab: TabOption) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: Array<{ id: TabOption; label: string; icon: React.ReactNode }> = [
    {
      id: "home",
      label: "Schedule",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      id: "shows",
      label: "Shows",
      icon: <ClipboardListIcon className="w-5 h-5" />,
    },
    {
      id: "groups",
      label: "Groups",
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <UserIcon className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center py-2 px-4 flex-1 ${
              activeTab === tab.id
                ? "text-primary font-medium"
                : "text-gray-500"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
