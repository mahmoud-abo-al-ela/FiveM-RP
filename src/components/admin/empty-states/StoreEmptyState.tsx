import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface StoreEmptyStateProps {
  onCreateClick?: () => void;
}

export function StoreEmptyState({ onCreateClick }: StoreEmptyStateProps) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="No store items"
      description="Add your first item to the store and start offering products to your community."
      action={
        onCreateClick && (
          <Button onClick={onCreateClick}>Add First Item</Button>
        )
      }
    />
  );
}
