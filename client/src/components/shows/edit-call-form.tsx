import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCallSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Group, Call } from "@shared/schema";
import { SaveIcon, XIcon, Trash2Icon, BellRingIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendNotification, requestNotificationPermission } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Extend the insertCallSchema with client-side validation
const editCallSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  minutesBefore: z.coerce
    .number()
    .min(1, "Must be at least 1 minute")
    .max(180, "Must be at most 180 minutes"),
  groupIds: z.array(z.number()).min(1, "Please select at least one group"),
  showId: z.coerce.number()
});

type EditCallFormValues = z.infer<typeof editCallSchema>;

interface EditCallFormProps {
  call: Call;
  onComplete: () => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function EditCallForm({
  call,
  onComplete,
  onCancel,
  onDelete
}: EditCallFormProps) {
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: [`/api/shows/${call.showId}/groups`],
    enabled: !!call.showId
  });
  
  // Parse groupIds from string if needed
  const initialGroupIds = typeof call.groupIds === 'string'
    ? JSON.parse(call.groupIds as string)
    : (call.groupIds || []);
  
  const form = useForm<EditCallFormValues>({
    resolver: zodResolver(editCallSchema),
    defaultValues: {
      title: call.title || "",
      description: call.description || "",
      minutesBefore: call.minutesBefore,
      groupIds: initialGroupIds,
      showId: call.showId
    }
  });
  
  const updateCall = useMutation({
    mutationFn: async (values: EditCallFormValues) => {
      const response = await apiRequest("PUT", `/api/calls/${call.id}`, values);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both specific show calls and all calls
      queryClient.invalidateQueries({ queryKey: [`/api/shows/${call.showId}/calls`] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      form.reset();
      onComplete();
    }
  });
  
  const onSubmit = (values: EditCallFormValues) => {
    updateCall.mutate(values);
  };
  
  const deleteCall = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/calls/${call.id}`);
      return response.ok;
    },
    onSuccess: () => {
      // Invalidate both specific show calls and all calls
      queryClient.invalidateQueries({ queryKey: [`/api/shows/${call.showId}/calls`] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      onComplete();
      if (onDelete) {
        onDelete(call.id);
      }
    }
  });
  
  // Toggle group selection
  const toggleGroup = (groupId: number) => {
    const currentSelection = form.getValues("groupIds") || [];
    const isSelected = currentSelection.includes(groupId);
    
    const newSelection = isSelected
      ? currentSelection.filter(id => id !== groupId)
      : [...currentSelection, groupId];
    
    // Update the form value
    form.setValue("groupIds", newSelection, { shouldValidate: true });
  };
  
  // Handle sending notifications
  const handleSendNotification = async () => {
    setIsSendingNotification(true);
    
    try {
      // Request notification permission
      const isPermissionGranted = await requestNotificationPermission();
      
      if (!isPermissionGranted) {
        toast({
          title: "Permission denied",
          description: "You need to grant notification permission to send notifications.",
          variant: "destructive"
        });
        return;
      }
      
      // Get selected group names for the notification
      const selectedGroupIds = form.getValues("groupIds");
      const selectedGroups = groups.filter(group => selectedGroupIds.includes(group.id));
      const groupNames = selectedGroups.map(group => group.name);
      
      // Format message
      const groupText = groupNames.length > 0 
        ? `${groupNames.join(', ')} Call`
        : 'Call';
      
      const callTitle = form.getValues("title");
      const callDescription = form.getValues("description");
      
      // Send the notification
      sendNotification(`${groupText}: ${callTitle || 'Call Time'}`, {
        body: callDescription 
          ? callDescription 
          : `Time for ${groupText}! Please prepare for the show.`,
        icon: "/favicon.ico"
      });
      
      // Show success toast
      toast({
        title: "Notification sent",
        description: `Notification sent to ${groupNames.join(', ') || 'all groups'}.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error sending notification",
        description: "There was a problem sending the notification.",
        variant: "destructive"
      });
      console.error("Notification error:", error);
    } finally {
      setIsSendingNotification(false);
    }
  };
  
  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-start">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-medium mr-3 mt-1">
          <SaveIcon className="h-4 w-4" />
        </div>
        <div className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cast Call" {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minutesBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">Minutes Before Show</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={180} 
                          placeholder="30" 
                          {...field} 
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional details" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="groupIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Groups</FormLabel>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {groups.map(group => {
                        const isSelected = field.value?.includes(group.id);
                        return (
                          <Badge
                            key={group.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer text-xs px-2 py-0.5 ${isSelected ? "bg-primary" : ""}`}
                            onClick={() => toggleGroup(group.id)}
                          >
                            {group.name}
                          </Badge>
                        );
                      })}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteCall.mutate()}
                    disabled={deleteCall.isPending || updateCall.isPending}
                    className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2Icon className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSendNotification}
                          disabled={isSendingNotification || form.getValues("groupIds").length === 0}
                          className="h-8 text-xs"
                        >
                          {isSendingNotification ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent mr-1" />
                          ) : (
                            <BellRingIcon className="h-3 w-3 mr-1" />
                          )}
                          Notify Groups
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Send notification to selected groups</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={onCancel}
                    disabled={updateCall.isPending || deleteCall.isPending || isSendingNotification}
                    className="h-8 text-xs"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={updateCall.isPending || deleteCall.isPending || isSendingNotification}
                    className="h-8 text-xs"
                  >
                    {updateCall.isPending ? "Saving..." : (
                      <>
                        <SaveIcon className="h-3 w-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}