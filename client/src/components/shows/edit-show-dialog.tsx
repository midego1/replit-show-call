import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertShowSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Show } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Extend the insertShowSchema with client-side fields for the form
const editShowSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

type EditShowFormValues = z.infer<typeof editShowSchema>;

interface EditShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: Show | null;
}

export function EditShowDialog({ 
  open, 
  onOpenChange,
  show 
}: EditShowDialogProps) {
  const queryClient = useQueryClient();
  
  // Format the date and time from the show object
  const getDefaultValues = () => {
    if (!show) return {
      name: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "19:00"
    };
    
    const startTime = new Date(show.startTime);
    const date = startTime.toISOString().split("T")[0];
    const time = startTime.toTimeString().slice(0, 5); // Get HH:MM format
    
    return {
      name: show.name,
      description: show.description || "",
      date,
      time
    };
  };
  
  const form = useForm<EditShowFormValues>({
    resolver: zodResolver(editShowSchema),
    defaultValues: getDefaultValues(),
    values: show ? getDefaultValues() : undefined
  });
  
  const updateShow = useMutation({
    mutationFn: async (values: EditShowFormValues) => {
      if (!show) return null;
      
      // Combine date and time into a Date object
      const startTime = new Date(`${values.date}T${values.time}`);
      
      // Format the values for the API
      const formattedValues = {
        name: values.name,
        description: values.description || "",
        startTime: startTime.toISOString()
      };
      
      const response = await apiRequest("PATCH", `/api/shows/${show.id}`, formattedValues);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shows'] });
      form.reset();
      onOpenChange(false);
    }
  });
  
  const onSubmit = (values: EditShowFormValues) => {
    updateShow.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Show</DialogTitle>
          <DialogDescription>Modify the details of your show</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Name</FormLabel>
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
                  <FormLabel>Description (Optional)</FormLabel>
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
                    <FormLabel>Date</FormLabel>
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
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4 border-t">
              <div 
                className="touch-manipulation"
                onClick={() => !updateShow.isPending && onOpenChange(false)}
              >
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={updateShow.isPending}
                >
                  Cancel
                </Button>
              </div>
              <div className="touch-manipulation">
                <Button 
                  type="submit" 
                  disabled={updateShow.isPending || !show}
                >
                  {updateShow.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}