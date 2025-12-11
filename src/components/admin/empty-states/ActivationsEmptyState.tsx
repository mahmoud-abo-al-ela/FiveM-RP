import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function ActivationsEmptyState() {
  return (
    <EmptyState
      icon={Clock}
      title="No pending activations"
      description="All user registrations have been reviewed. New signups will appear here for approval."
    />
  );
}
