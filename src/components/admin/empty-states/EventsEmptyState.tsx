import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface EventsEmptyStateProps {
  onCreateClick?: () => void;
}

export function EventsEmptyState({ onCreateClick }: EventsEmptyStateProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="No events scheduled"
      description="Create your first event to engage with your community and organize activities."
      action={
        onCreateClick && (
          <Button onClick={onCreateClick}>Schedule First Event</Button>
        )
      }
    />
  );
}
