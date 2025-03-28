import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertShowSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PlusIcon, CheckIcon } from "lucide-react";

// Extend the insertShowSchema with client-side fields for the form
const createShowSchema = z.object({
  name: z.string().min(1, "Show name is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  groups: z.array(z.string())
});

type CreateShowFormValues = z.infer<typeof createShowSchema>;

interface CreateShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateShowDialog({ open, onOpenChange }: CreateShowDialogProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["All", "Cast", "Crew"]);
  const queryClient = useQueryClient();
  
  const form = useForm<CreateShowFormValues>({
    resolver: zodResolver(createShowSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
      groups: ["All", "Cast", "Crew"]
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
    values.groups = selectedGroups;
    createShow.mutate(values);
  };
  
  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };
  
  const defaultGroups = ["All", "Cast", "Crew", "Staff", "Guests"];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Show</DialogTitle>
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
            
            <FormItem>
              <FormLabel>Groups</FormLabel>
              <div className="flex flex-wrap gap-2 mt-1">
                {defaultGroups.map(group => (
                  <Button
                    key={group}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`rounded-full flex items-center ${
                      selectedGroups.includes(group) 
                        ? "bg-blue-100 text-blue-800 border-blue-300" 
                        : ""
                    }`}
                    onClick={() => toggleGroup(group)}
                  >
                    <span>{group}</span>
                    {selectedGroups.includes(group) && <CheckIcon className="ml-1 h-4 w-4" />}
                  </Button>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full"
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Custom
                </Button>
              </div>
            </FormItem>
            
            <DialogFooter className="pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={createShow.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createShow.isPending}
              >
                {createShow.isPending ? "Creating..." : "Create Show"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
