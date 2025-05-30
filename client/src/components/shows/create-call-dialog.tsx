import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCallSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { XIcon, SaveIcon } from "lucide-react";

// Extend the insertCallSchema with client-side validation
const createCallSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  minutesBefore: z.coerce
    .number()
    .min(1, "Must be at least 1 minute")
    .max(180, "Must be at most 180 minutes"),
  groupIds: z.array(z.number()).default([]), // Empty array as groups functionality has been removed
  showId: z.coerce.number(),
  sendNotification: z.boolean().default(false)
});

type CreateCallFormValues = z.infer<typeof createCallSchema>;

interface CreateCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showId: number | null;
}

export function CreateCallDialog({ 
  open, 
  onOpenChange,
  showId 
}: CreateCallDialogProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<CreateCallFormValues>({
    resolver: zodResolver(createCallSchema),
    defaultValues: {
      title: "",
      description: "",
      minutesBefore: 30,
      groupIds: [],
      showId: showId || 0,
      sendNotification: false
    }
  });
  
  const createCall = useMutation({
    mutationFn: async (values: CreateCallFormValues) => {
      const response = await apiRequest("POST", "/api/calls", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      if (showId) {
        queryClient.invalidateQueries({ queryKey: [`/api/shows/${showId}/calls`] });
      }
      form.reset();
      onOpenChange(false);
    }
  });
  
  const onSubmit = (values: CreateCallFormValues) => {
    createCall.mutate(values);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Call</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Warm-up Call" {...field} />
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
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional details about this call" {...field} />
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
                  <FormLabel>Minutes Before Show</FormLabel>
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
            
            <FormField
              control={form.control}
              name="sendNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div>
                    <FormLabel>Send Notification</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={createCall.isPending}
                      aria-readonly={createCall.isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4 border-t">
              <div
                className="touch-manipulation"
                onClick={() => !createCall.isPending && onOpenChange(false)}
              >
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={createCall.isPending}
                  className="h-8 text-xs"
                >
                  <XIcon className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
              <div className="touch-manipulation">
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={createCall.isPending || !showId}
                  className="h-8 text-xs"
                >
                  {createCall.isPending ? "Adding..." : (
                    <>
                      <SaveIcon className="h-3 w-3 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
