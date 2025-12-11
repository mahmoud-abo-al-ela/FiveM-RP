import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function UsersEmptyState() {
  return (
    <EmptyState
      icon={Users}
      title="No users found"
      description="There are no registered users yet. Users will appear here once they sign up."
    />
  );
}
