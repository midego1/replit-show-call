import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Group, Show, insertGroupSchema } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, Trash2Icon, CheckIcon, PlusCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema for creating a custom group
const createGroupSchema = insertGroupSchema.extend({
  showId: z.number().nullable().optional(),
});

type CreateGroupValues = z.infer<typeof createGroupSchema>;

// Define GroupWithDetails type locally since we removed it from types.ts
type GroupWithDetails = Group & {
  icon?: string;
};

export default function Groups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);
  const [addToShowDialogOpen, setAddToShowDialogOpen] = useState(false);
  const [groupToAddToShow, setGroupToAddToShow] = useState<Group | null>(null);
  
  // Fetch groups
  const { data: allGroups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
  });
  
  // Fetch shows
  const { data: shows = [] } = useQuery<Show[]>({
    queryKey: ['/api/shows'],
  });
  
  // Process groups
  const defaultGroups: GroupWithDetails[] = allGroups
    .filter(group => group.isCustom === 0)
    .map(group => {
      let icon;
      switch (group.name) {
        case "Cast": icon = "person"; break;
        case "Crew": icon = "tools"; break;
        default: icon = "users";
      }
      return { ...group, icon };
    });
  
  const customGroups: GroupWithDetails[] = allGroups
    .filter(group => group.isCustom === 1 && !group.showId)
    .map(group => ({ ...group, icon: "tag" }));
  
  // Group by show
  const showGroups: Record<number, GroupWithDetails[]> = {};
  
  allGroups.filter(group => group.isCustom === 1 && group.showId)
    .forEach(group => {
      const showId = group.showId!;
      if (!showGroups[showId]) {
        showGroups[showId] = [];
      }
      showGroups[showId].push({ ...group, icon: "tag" });
    });
  
  // Form for creating a new custom group
  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      isCustom: 1,
      showId: null,
    },
  });
  
  // Create group mutation
  const createGroup = useMutation({
    mutationFn: async (values: CreateGroupValues) => {
      // If selectedShowId is set, assign this group to that show
      if (selectedShowId) {
        values.showId = selectedShowId;
      }
      const response = await apiRequest("POST", "/api/groups", values);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shows'] });
      if (selectedShowId) {
        queryClient.invalidateQueries({ queryKey: ['/api/shows', selectedShowId, 'groups'] });
      }
      setAddGroupDialogOpen(false);
      form.reset();
      toast({
        title: "Group created",
        description: "The group has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create group: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Add existing group to show mutation
  const addGroupToShow = useMutation({
    mutationFn: async ({ groupId, showId }: { groupId: number, showId: number }) => {
      // Create a copy of the group with the showId
      const group = allGroups.find(g => g.id === groupId);
      if (!group) throw new Error("Group not found");
      
      const newGroup = {
        name: group.name,
        isCustom: 1,
        showId: showId
      };
      
      const response = await apiRequest("POST", "/api/groups", newGroup);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      if (selectedShowId) {
        queryClient.invalidateQueries({ queryKey: ['/api/shows', selectedShowId, 'groups'] });
      }
      setAddToShowDialogOpen(false);
      setGroupToAddToShow(null);
      toast({
        title: "Group added to show",
        description: "The group has been successfully added to the show."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add group to show: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
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
  
  const onSubmit = (values: CreateGroupValues) => {
    createGroup.mutate(values);
  };

  const handleAddToShow = (group: Group) => {
    setGroupToAddToShow(group);
    setAddToShowDialogOpen(true);
  };
  
  const confirmAddToShow = () => {
    if (groupToAddToShow && selectedShowId) {
      addGroupToShow.mutate({ 
        groupId: groupToAddToShow.id, 
        showId: selectedShowId 
      });
    }
  };
  
  return (
    <div className="px-4 py-4 container mx-auto max-w-4xl">
      <h2 className="text-xl font-medium mb-4">Groups</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">About Groups in Show Caller</p>
        <p>Groups in Show Caller are now show-specific. This means:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Create groups directly for a specific show</li>
          <li>Each show maintains its own separate set of groups</li>
          <li>When creating calls, only groups assigned to that show will be available</li>
        </ul>
      </div>
      
      <Card className="mb-6 shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium">Group Templates</h3>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {defaultGroups.map(group => (
              <li key={group.id} className="flex items-center px-4 py-3">
                <GroupIcon name={group.icon || "users"} className="mr-3 text-primary h-5 w-5" />
                <span className="flex-grow">{group.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => handleAddToShow(group)}
                >
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  Add to show
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="mb-6 shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium">Global Custom Groups</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary"
            onClick={() => {
              setSelectedShowId(null);
              setAddGroupDialogOpen(true);
            }}
          >
            <PlusIcon className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {customGroups.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {customGroups.map(group => (
                <li key={group.id} className="flex items-center px-4 py-3">
                  <GroupIcon name={group.icon || "users"} className="mr-3 text-secondary h-5 w-5" />
                  <span className="flex-grow">{group.name}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary"
                      onClick={() => handleAddToShow(group)}
                    >
                      <PlusCircleIcon className="h-4 w-4 mr-1" />
                      Add to show
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
                onClick={() => {
                  setSelectedShowId(null);
                  setAddGroupDialogOpen(true);
                }}
              >
                Create custom group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Show-specific groups */}
      {shows.length > 0 && (
        <div className="space-y-6">
          {shows.map(show => (
            <Card key={show.id} className="shadow-sm overflow-hidden">
              <CardHeader className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium">Groups for '{show.name}'</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary"
                  onClick={() => {
                    setSelectedShowId(show.id);
                    setAddGroupDialogOpen(true);
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {showGroups[show.id] && showGroups[show.id].length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {showGroups[show.id].map(group => (
                      <li key={group.id} className="flex items-center px-4 py-3">
                        <GroupIcon name={group.icon || "users"} className="mr-3 text-secondary h-5 w-5" />
                        <span className="flex-grow">{group.name}</span>
                        <div className="flex space-x-2">
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
                    <p>No groups for this show yet</p>
                    <Button 
                      variant="link" 
                      className="text-primary mt-2"
                      onClick={() => {
                        setSelectedShowId(show.id);
                        setAddGroupDialogOpen(true);
                      }}
                    >
                      Add a group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Group Dialog */}
      <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              {selectedShowId 
                ? `Add a custom group to "${shows.find(s => s.id === selectedShowId)?.name}"`
                : "Create a global group template (can be added to specific shows later)"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createGroup.isPending}>
                  {createGroup.isPending && <span className="animate-spin mr-2">•</span>}
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add to Show Dialog */}
      <Dialog open={addToShowDialogOpen} onOpenChange={setAddToShowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Group to Show</DialogTitle>
            <DialogDescription>
              Add "{groupToAddToShow?.name}" to a show
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="showSelect">Select Show</Label>
            <Select 
              value={selectedShowId?.toString() || ""} 
              onValueChange={(value) => setSelectedShowId(parseInt(value))}
            >
              <SelectTrigger id="showSelect" className="w-full">
                <SelectValue placeholder="Select a show" />
              </SelectTrigger>
              <SelectContent>
                {shows.map(show => (
                  <SelectItem key={show.id} value={show.id.toString()}>
                    {show.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={confirmAddToShow} 
              disabled={!selectedShowId || addGroupToShow.isPending}
            >
              {addGroupToShow.isPending && <span className="animate-spin mr-2">•</span>}
              Add to Show
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
