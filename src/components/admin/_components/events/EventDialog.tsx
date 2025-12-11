import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useRef } from "react";

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
  uploadedImage: string | null;
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export function EventDialog({ 
  open, 
  onOpenChange, 
  editingEvent,
  uploadedImage,
  isUploading,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  isSubmitting
}: EventDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit}>
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
              <Label>Event Image</Label>
              <div className="space-y-2">
                {uploadedImage ? (
                  <div className="relative border rounded-lg p-4 bg-muted/30">
                    <img src={uploadedImage} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                    <Button type="button" variant="destructive" size="sm" onClick={onRemoveImage} className="w-full">
                      <X className="h-4 w-4 mr-2" /> Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" id="event-image-upload" />
                    <label htmlFor="event-image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                        <div className="text-sm text-muted-foreground">{isUploading ? "Uploading..." : "Click to upload event image"}</div>
                        <div className="text-xs text-muted-foreground">PNG, JPG up to 5MB</div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingEvent ? "Updating..." : "Creating..."}
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
