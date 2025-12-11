import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface RulesEmptyStateProps {
  onCreateClick?: () => void;
}

export function RulesEmptyState({ onCreateClick }: RulesEmptyStateProps) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No rules created"
      description="Add your first rule to help players understand your server guidelines and expectations."
      action={
        onCreateClick && (
          <Button onClick={onCreateClick}>Create First Rule</Button>
        )
      }
    />
  );
}
