import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertShowSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { XIcon, SaveIcon } from "lucide-react";

// Extend the insertShowSchema with client-side fields for the form
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
  
  const form = useForm<CreateShowFormValues>({
    resolver: zodResolver(createShowSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
    }
  });
  
  const createShow = useMutation({
    mutationFn: async (values: CreateShowFormValues) => {
      const startTime = new Date(`${values.date}T${values.time}`);
      
      const data = {
        name: values.name,
        description: values.description || "",
        startTime: startTime.toISOString(),
        userId: 1 // Default user ID
      };
      
      const response = await apiRequest("POST", "/api/shows", data);
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
      <h3 className="text-lg font-medium mb-4">Create New Show</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Show Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Evening Performance" {...field} />
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
                <FormLabel className="text-sm font-medium">Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the show" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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