import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCallSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Group } from "@shared/schema";
import { XIcon, SaveIcon, UsersIcon, BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Extend the insertCallSchema with client-side validation
const createCallSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  minutesBefore: z.coerce
    .number()
    .min(1, "Must be at least 1 minute")
    .max(180, "Must be at most 180 minutes"),
  // Array of groupIds
  groupIds: z.array(z.number()).min(1, "Please select at least one group"),
  showId: z.coerce.number(),
  sendNotification: z.boolean().default(false)
});

type CreateCallFormValues = z.infer<typeof createCallSchema>;

interface InlineCallFormProps {
  showId: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function InlineCallForm({
  showId,
  onComplete,
  onCancel
}: InlineCallFormProps) {
  const queryClient = useQueryClient();
  
  const { data: groups = [] } = useQuery<Group[]>({
    queryKey: [`/api/shows/${showId}/groups`],
    enabled: !!showId
  });
  
  const form = useForm<CreateCallFormValues>({
    resolver: zodResolver(createCallSchema),
    defaultValues: {
      title: "",
      description: "",
      minutesBefore: 30,
      groupIds: groups.length > 0 ? [groups[0].id] : [],
      showId: showId,
      sendNotification: false
    }
  });
  
  const createCall = useMutation({
    mutationFn: async (values: CreateCallFormValues) => {
      const response = await apiRequest("POST", "/api/calls", values);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both specific show calls and all calls
      queryClient.invalidateQueries({ queryKey: [`/api/shows/${showId}/calls`] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      form.reset();
      onComplete();
    }
  });
  
  const onSubmit = (values: CreateCallFormValues) => {
    createCall.mutate(values);
  };
  
  return (
    <div className="bg-white p-4 border-t border-b border-gray-200">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Warm-up Call" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Stage right entrance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="minutesBefore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Minutes Before</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={180} 
                      placeholder="e.g., 30" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="groupIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium">
                  <UsersIcon className="h-4 w-4 mr-1" /> 
                  Assign to Groups (select multiple)
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {groups.map((group) => {
                      const isSelected = field.value.includes(group.id);
                      return (
                        <Badge 
                          key={group.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer ${isSelected ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
                          onClick={() => {
                            if (isSelected) {
                              // Remove group if already selected
                              field.onChange(field.value.filter(id => id !== group.id));
                            } else {
                              // Add group if not selected
                              field.onChange([...field.value, group.id]);
                            }
                          }}
                        >
                          {group.name}
                        </Badge>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sendNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center text-sm font-medium">
                    <BellIcon className="h-4 w-4 mr-1" />
                    Auto Notifications
                  </FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    Send notification automatically when call time is reached
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={createCall.isPending}
                    aria-readonly={createCall.isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={createCall.isPending}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={createCall.isPending}
            >
              {createCall.isPending ? "Saving..." : (
                <>
                  <SaveIcon className="h-4 w-4 mr-1" />
                  Save Call
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}