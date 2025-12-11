import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  expiration_date: string;
  created_at: string;
}

export function useEventMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (event: Partial<Event>) => {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create event");
      }
      return res.json();
    },
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: ["admin-events"] });
      const previousEvents = queryClient.getQueryData(["admin-events"]);
      const tempId = Date.now();
      const optimisticEvent = {
        ...newEvent,
        id: tempId,
        created_at: new Date().toISOString(),
      } as Event;
      
      queryClient.setQueryData(["admin-events"], (old: Event[] = []) => 
        [optimisticEvent, ...old]
      );
      
      toast.loading(`Creating "${newEvent.title}"...`, {
        id: "create-event",
      });
      
      return { previousEvents, tempId };
    },
    onSuccess: (data, variables) => {
      toast.dismiss("create-event");
      const eventTitle = data?.title || variables?.title || "Event";
      toast.success("Event created", {
        description: `"${eventTitle}" is now live and visible to users`,
        duration: 3000,
      });
    },
    onError: (error: Error, _variables, context) => {
      toast.dismiss("create-event");
      if (context?.previousEvents) {
        queryClient.setQueryData(["admin-events"], context.previousEvents);
      }
      toast.error("Failed to create event", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (event: Event) => {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update event");
      }
      return res.json();
    },
    onMutate: async (updatedEvent) => {
      await queryClient.cancelQueries({ queryKey: ["admin-events"] });
      const previousEvents = queryClient.getQueryData(["admin-events"]);
      
      queryClient.setQueryData(["admin-events"], (old: Event[] = []) => 
        old.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
      );
      
      toast.loading(`Updating "${updatedEvent.title}"...`, {
        id: `update-${updatedEvent.id}`,
      });
      
      return { previousEvents };
    },
    onSuccess: (data, variables) => {
      toast.dismiss(`update-${variables.id}`);
      const eventTitle = data?.title || variables?.title || "Event";
      toast.success("Event updated", {
        description: `"${eventTitle}" changes have been saved`,
        duration: 3000,
      });
    },
    onError: (error: Error, variables, context) => {
      toast.dismiss(`update-${variables.id}`);
      if (context?.previousEvents) {
        queryClient.setQueryData(["admin-events"], context.previousEvents);
      }
      toast.error("Failed to update event", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete event");
      }
      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-events"] });
      const previousEvents = queryClient.getQueryData(["admin-events"]);
      const events = queryClient.getQueryData<Event[]>(["admin-events"]) || [];
      const deletedEvent = events.find((e) => e.id === deletedId);
      
      toast.loading(`Deleting "${deletedEvent?.title || 'event'}"...`, {
        id: `delete-${deletedId}`,
      });
      
      return { previousEvents, deletedEvent };
    },
    onSuccess: (_data, deletedId, context) => {
      toast.dismiss(`delete-${deletedId}`);
      queryClient.setQueryData(["admin-events"], (old: Event[] = []) => 
        old.filter((event) => event.id !== deletedId)
      );
      toast.success("Event deleted", {
        description: context?.deletedEvent ? `"${context.deletedEvent.title}" has been permanently removed` : "The event has been removed",
        duration: 3000,
      });
    },
    onError: (error: Error, deletedId, context) => {
      toast.dismiss(`delete-${deletedId}`);
      if (context?.previousEvents) {
        queryClient.setQueryData(["admin-events"], context.previousEvents);
      }
      toast.error("Failed to delete event", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
