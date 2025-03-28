import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { XIcon, SaveIcon } from "lucide-react";

// Create show schema
const createShowSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

type CreateShowFormValues = z.infer<typeof createShowSchema>;

interface InlineShowFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function InlineShowForm({
  onComplete,
  onCancel,
}: InlineShowFormProps) {
  const queryClient = useQueryClient();
  
  // Get current date and time for default values
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const formattedTime = '19:00'; // Default to 7 PM
  
  const form = useForm<CreateShowFormValues>({
    resolver: zodResolver(createShowSchema),
    defaultValues: {
      name: "",
      description: "",
      date: formattedDate,
      time: formattedTime,
    }
  });
  
  const createShow = useMutation({
    mutationFn: async (values: CreateShowFormValues) => {
      const startTime = new Date(`${values.date}T${values.time}`);
      
      const data = {
        name: values.name,
        description: values.description || "",
        startTime: startTime.toISOString(),
      };
      
      const response = await apiRequest("POST", "/api/shows", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shows'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calls'] });
      form.reset();
      onComplete();
    }
  });
  
  const onSubmit = (values: CreateShowFormValues) => {
    createShow.mutate(values);
  };
  
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Show Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Evening Performance" {...field} className="h-9" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the show" 
                    className="resize-none min-h-[60px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="h-9" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="h-9" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={createShow.isPending}
              className="h-8 text-xs"
            >
              <XIcon className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={createShow.isPending}
              className="h-8 text-xs"
            >
              {createShow.isPending ? "Saving..." : (
                <>
                  <SaveIcon className="h-3 w-3 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}