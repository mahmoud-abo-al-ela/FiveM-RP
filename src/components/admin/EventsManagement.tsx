"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  const { createMutation, updateMutation, deleteMutation } = useEventMutations();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const event = {
      id: editingEvent?.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: uploadedImage || null,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedImage(data.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  const handleDeleteConfirm = (event: Event) => {
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setDeletingEventId(event.id);
    deleteMutation.mutate(event.id);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setUploadedImage(event.image_url);
    setIsDialogOpen(true);
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
            setUploadedImage(null);
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
            setUploadedImage(null);
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
                    onEdit={handleEditEvent}
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
            if (!open) {
              setEditingEvent(null);
              setUploadedImage(null);
            }
          }}
          editingEvent={editingEvent}
          uploadedImage={uploadedImage}
          isUploading={isUploading}
          onImageUpload={handleImageUpload}
          onRemoveImage={handleRemoveImage}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
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
