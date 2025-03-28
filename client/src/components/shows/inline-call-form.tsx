import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCallSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Group } from "@shared/schema";
import { XIcon, SaveIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Extend the insertCallSchema with client-side validation
const createCallSchema = z.object({
  description: z.string().min(1, "Description is required"),
  minutesBefore: z.coerce
    .number()
    .min(1, "Must be at least 1 minute")
    .max(180, "Must be at most 180 minutes"),
  groupId: z.coerce.number({ required_error: "Please select a group" }),
  showId: z.coerce.number()
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
      description: "",
      minutesBefore: 30,
      groupId: groups.length > 0 ? groups[0].id : 0,
      showId: showId
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Warm-up Call" {...field} />
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
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium">
                  <UsersIcon className="h-4 w-4 mr-1" /> 
                  Assign to Group
                </FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {groups.map((group) => (
                      <Badge 
                        key={group.id}
                        variant={field.value === group.id ? "default" : "outline"}
                        className={`cursor-pointer ${field.value === group.id ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
                        onClick={() => field.onChange(group.id)}
                      >
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </FormControl>
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