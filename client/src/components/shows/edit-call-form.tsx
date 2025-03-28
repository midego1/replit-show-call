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
import { SaveIcon, XIcon } from "lucide-react";

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
}

export function EditCallForm({
  call,
  onComplete,
  onCancel
}: EditCallFormProps) {
  const queryClient = useQueryClient();
  
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
                  <Input placeholder="e.g., Cast Call" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Description (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Additional details" {...field} />
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
                <FormLabel className="text-sm font-medium">Minutes Before Show</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    max={180} 
                    placeholder="30" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="groupIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Groups</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {groups.map(group => {
                    const isSelected = field.value?.includes(group.id);
                    return (
                      <Badge
                        key={group.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`cursor-pointer ${isSelected ? "bg-primary" : ""}`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        {group.name}
                      </Badge>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={updateCall.isPending}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={updateCall.isPending}
            >
              {updateCall.isPending ? "Saving..." : (
                <>
                  <SaveIcon className="h-4 w-4 mr-1" />
                  Update Call
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}