"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { EventsEmptyState } from "./empty-states";
import { EventCard, EventDialog, DeleteEventDialog, useEventMutations } from "./_components/events";
import { DataPagination } from "@/components/ui/data-pagination";

const ITEMS_PER_PAGE = 10;

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  expiration_date: string;
  created_at: string;
}

export function EventsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [pendingEventId] = useState<number | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const { createMutation, updateMutation, deleteMutation } = useEventMutations();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, imageFile: File | null) => {
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = formData.get("image_url") as string;
    
    if (imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }
    
    const event = {
      id: editingEvent?.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: imageUrl,
      event_date: formData.get("event_date") as string,
      expiration_date: formData.get("expiration_date") as string,
    };

    setIsDialogOpen(false);
    setEditingEvent(null);

    if (editingEvent) {
      updateMutation.mutate(event as Event);
    } else {
      createMutation.mutate(event);
    }
  };

  const handleDeleteConfirm = (event: Event) => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setDeletingEventId(event.id);
    deleteMutation.mutate(event.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Events Management</CardTitle>
            <CardDescription>Create and manage server events</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingEvent(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <EventsEmptyState onCreateClick={() => {
            setEditingEvent(null);
            setIsDialogOpen(true);
          }} />
        ) : (
          <>
            <div className="space-y-4">
              {events
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((event: Event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isPending={pendingEventId === event.id}
                    isDeleting={deletingEventId === event.id}
                    onEdit={(event) => {
                      setEditingEvent(event);
                      setIsDialogOpen(true);
                    }}
                    onDelete={(event) => {
                      setEventToDelete(event);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={Math.ceil(events.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </>
        )}

        <EventDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingEvent(null);
          }}
          editingEvent={editingEvent}
          onSubmit={handleSubmit}
          isCreating={createMutation.isPending}
          isUpdating={updateMutation.isPending}
        />

        <DeleteEventDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setEventToDelete(null);
          }}
          event={eventToDelete}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
