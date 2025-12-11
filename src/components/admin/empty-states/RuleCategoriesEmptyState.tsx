import { FolderPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface RuleCategoriesEmptyStateProps {
  onCreateClick?: () => void;
}

export function RuleCategoriesEmptyState({ onCreateClick }: RuleCategoriesEmptyStateProps) {
  return (
    <EmptyState
      icon={FolderPlus}
      title="No categories yet"
      description="Create your first category to organize and structure your server rules."
      action={
        onCreateClick && (
          <Button onClick={onCreateClick}>Add First Category</Button>
        )
      }
    />
  );
}
