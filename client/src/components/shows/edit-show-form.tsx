import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Show } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { XIcon, SaveIcon, Trash2Icon } from "lucide-react";

// Schema for editing a show
const editShowSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

type EditShowFormValues = z.infer<typeof editShowSchema>;

interface EditShowFormProps {
  show: Show;
  onComplete: () => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
}

export function EditShowForm({
  show,
  onComplete,
  onCancel,
  onDelete
}: EditShowFormProps) {
  const queryClient = useQueryClient();
  
  // Parse the show date and time for form values
  const showDate = new Date(show.startTime);
  const formattedDate = showDate.toISOString().split('T')[0];
  const formattedTime = showDate.toTimeString().substring(0, 5);
  
  const form = useForm<EditShowFormValues>({
    resolver: zodResolver(editShowSchema),
    defaultValues: {
      name: show.name,
      description: show.description || "",
      date: formattedDate,
      time: formattedTime,
    }
  });
  
  const updateShow = useMutation({
    mutationFn: async (values: EditShowFormValues) => {
      const startTime = new Date(`${values.date}T${values.time}`);
      
      const data = {
        name: values.name,
        description: values.description || "",
        startTime: startTime.toISOString(),
      };
      
      const response = await apiRequest("PUT", `/api/shows/${show.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shows"] });
      form.reset();
      onComplete();
    }
  });
  
  const onSubmit = (values: EditShowFormValues) => {
    updateShow.mutate(values);
  };
  
  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${show.name}"?`)) {
      onDelete(show.id);
    }
  };
  
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
              disabled={updateShow.isPending}
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
                disabled={updateShow.isPending}
                className="h-8 text-xs"
              >
                <XIcon className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                disabled={updateShow.isPending}
                className="h-8 text-xs"
              >
                {updateShow.isPending ? "Saving..." : (
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
  );
}