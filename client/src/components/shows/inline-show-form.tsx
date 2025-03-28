import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertShowSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { XIcon, SaveIcon, CalendarIcon, ClockIcon } from "lucide-react";

// Extend the insertShowSchema with client-side validation
const createShowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Get current date/time for default values
  const now = new Date();
  now.setMinutes(now.getMinutes() + 60); // Default to 1 hour from now
  const defaultDateTime = now.toISOString().slice(0, 16);
  
  const form = useForm<CreateShowFormValues>({
    resolver: zodResolver(createShowSchema),
    defaultValues: {
      name: "",
      description: "",
      startTime: defaultDateTime,
    }
  });
  
  const createShow = useMutation({
    mutationFn: async (values: CreateShowFormValues) => {
      const response = await apiRequest("POST", "/api/shows", {
        ...values,
        startTime: new Date(values.startTime).toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shows"] });
      form.reset();
      onComplete();
    }
  });
  
  const onSubmit = (values: CreateShowFormValues) => {
    createShow.mutate(values);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Show Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spring Concert" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main auditorium" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center text-sm font-medium">
                  <CalendarIcon className="h-4 w-4 mr-1" /> 
                  Show Date & Time
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      className="pr-10"
                    />
                    <ClockIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
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
              disabled={createShow.isPending}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={createShow.isPending}
            >
              {createShow.isPending ? "Saving..." : (
                <>
                  <SaveIcon className="h-4 w-4 mr-1" />
                  Save Show
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}