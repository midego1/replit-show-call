import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertShowSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Extend the insertShowSchema with client-side fields for the form
const createShowSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
});

type CreateShowFormValues = z.infer<typeof createShowSchema>;

interface CreateShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateShowDialog({ open, onOpenChange }: CreateShowDialogProps) {
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
        startTime: startTime.toISOString(), // Convert to ISO string format
        userId: 1 // Default user ID
      };
      
      const response = await apiRequest("POST", "/api/shows", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shows"] });
      form.reset();
      onOpenChange(false);
    }
  });
  
  const onSubmit = (values: CreateShowFormValues) => {
    createShow.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Show</DialogTitle>
          <DialogDescription>Add a new show to your calendar</DialogDescription>
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
                onClick={() => !createShow.isPending && onOpenChange(false)}
              >
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={createShow.isPending}
                >
                  Cancel
                </Button>
              </div>
              <div className="touch-manipulation">
                <Button 
                  type="submit" 
                  disabled={createShow.isPending}
                >
                  {createShow.isPending ? "Creating..." : "Create Show"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
