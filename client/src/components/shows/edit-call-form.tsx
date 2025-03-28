import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCallSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Call } from "@shared/schema";
import { SaveIcon, XIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend the insertCallSchema with client-side validation
const editCallSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  minutesBefore: z.coerce
    .number()
    .min(1, "Must be at least 1 minute")
    .max(180, "Must be at most 180 minutes"),
  groupIds: z.array(z.number()).default([]),
  showId: z.coerce.number(),
  sendNotification: z.boolean().default(false)
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Parse groupIds from string if needed - keeping this for backward compatibility
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
      showId: call.showId,
      sendNotification: call.sendNotification === 1
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
  
  // The notification and group functions have been removed
  
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
                name="sendNotification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div>
                      <FormLabel className="text-xs font-medium">Send Notification</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={updateCall.isPending}
                        aria-readonly={updateCall.isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Action buttons - matches show form styling */}
              <div className="flex justify-between pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteCall.mutate()}
                  disabled={deleteCall.isPending || updateCall.isPending}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                >
                  <Trash2Icon className="h-3 w-3 mr-1" />
                  Delete
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={onCancel}
                    disabled={updateCall.isPending || deleteCall.isPending}
                    className="h-8 text-xs"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={updateCall.isPending || deleteCall.isPending}
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