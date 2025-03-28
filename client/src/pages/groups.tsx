import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Group } from "@shared/schema";
import { GroupWithDetails } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Groups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch groups
  const { data: allGroups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Process groups
  const defaultGroups: GroupWithDetails[] = allGroups
    .filter(group => group.isCustom === 0)
    .map(group => {
      let icon;
      switch (group.name) {
        case "All": icon = "group"; break;
        case "Cast": icon = "person"; break;
        case "Crew": icon = "tools"; break;
        case "Staff": icon = "briefcase"; break;
        case "Guests": icon = "gift"; break;
        default: icon = "users";
      }
      return { ...group, icon };
    });
  
  const customGroups: GroupWithDetails[] = allGroups
    .filter(group => group.isCustom === 1)
    .map(group => ({ ...group, icon: "tag" }));
  
  // Delete group mutation
  const deleteGroup = useMutation({
    mutationFn: async (groupId: number) => {
      await apiRequest("DELETE", `/api/groups/${groupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: "Group deleted",
        description: "The group has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleDeleteGroup = (groupId: number, groupName: string) => {
    if (confirm(`Are you sure you want to delete "${groupName}"? This cannot be undone.`)) {
      deleteGroup.mutate(groupId);
    }
  };
  
  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      <h2 className="text-xl font-medium mb-6">Groups</h2>
      
      <Card className="mb-6 shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Default Groups</h3>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {defaultGroups.map(group => (
              <li key={group.id} className="flex items-center px-4 py-3">
                <GroupIcon name={group.icon} className="mr-3 text-primary h-5 w-5" />
                <span className="flex-grow">{group.name}</span>
                <span className="text-sm text-gray-500">System</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium">Custom Groups</h3>
          <Button variant="ghost" size="icon" className="text-primary">
            <PlusIcon className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {customGroups.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {customGroups.map(group => (
                <li key={group.id} className="flex items-center px-4 py-3">
                  <GroupIcon name={group.icon} className="mr-3 text-secondary h-5 w-5" />
                  <span className="flex-grow">{group.name}</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary">
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-destructive"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      disabled={deleteGroup.isPending}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-gray-500">
              <p>No custom groups yet</p>
              <Button 
                variant="link" 
                className="text-primary mt-2"
              >
                Create custom group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GroupIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "group":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case "person":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    case "tools":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      );
    case "briefcase":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      );
    case "gift":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
      );
    case "tag":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
  }
}
