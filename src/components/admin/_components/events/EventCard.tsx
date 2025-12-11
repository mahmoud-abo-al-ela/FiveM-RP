import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2 } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  expiration_date: string;
  created_at: string;
}

interface EventCardProps {
  event: Event;
  isPending: boolean;
  isDeleting: boolean;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export function EventCard({ event, isPending, isDeleting, onEdit, onDelete }: EventCardProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 border rounded-lg relative transition-opacity ${
        isPending || isDeleting ? "opacity-60" : "opacity-100"
      }`}
    >
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-lg">{event.title}</div>
        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <Calendar className="h-4 w-4" />
          {new Date(event.event_date).toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Expires: {new Date(event.expiration_date).toLocaleString()}
        </div>
        {event.description && (
          <div className="text-sm mt-2 line-clamp-2">{event.description}</div>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(event)}
          disabled={isPending || isDeleting}
          className="h-8 w-8"
          title="Edit event"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(event)}
          disabled={isPending || isDeleting}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
          title="Delete event"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
