import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Loader2 } from "lucide-react";
import { useState } from "react";

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  expiration_date: string;
  created_at: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: Event | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, imageFile: File | null) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function EventDialog({ 
  open, 
  onOpenChange, 
  editingEvent, 
  onSubmit, 
  isCreating, 
  isUpdating 
}: EventDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e, imageFile);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setImageFile(null);
      setImagePreview(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent ? "Update event details" : "Create a new server event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingEvent?.title}
                placeholder="Summer Tournament 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingEvent?.description || ""}
                placeholder="Join us for an exciting tournament..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                defaultValue={editingEvent?.image_url || ""}
                placeholder="https://example.com/event-image.jpg"
                disabled={!!imageFile}
              />
              <div className="text-sm text-muted-foreground mt-1">Or upload a file below</div>
            </div>
            <div>
              <Label htmlFor="image_file">Upload Image</Label>
              <Input
                id="image_file"
                name="image_file"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(imagePreview || editingEvent?.image_url) && (
                <div className="mt-2">
                  <img
                    src={imagePreview || editingEvent?.image_url || ""}
                    alt="Preview"
                    className="w-full max-w-xs h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="datetime-local"
                  defaultValue={editingEvent?.event_date ? new Date(editingEvent.event_date).toISOString().slice(0, 16) : ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiration_date">Expiration Date</Label>
                <Input
                  id="expiration_date"
                  name="expiration_date"
                  type="datetime-local"
                  defaultValue={editingEvent?.expiration_date ? new Date(editingEvent.expiration_date).toISOString().slice(0, 16) : ""}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isCreating || isUpdating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {editingEvent ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Event
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
