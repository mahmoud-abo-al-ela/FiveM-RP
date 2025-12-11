import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical, Loader2 } from "lucide-react";
import { Rule } from "./types";

interface RuleCardProps {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
  isDeleting?: boolean;
}

export function RuleCard({ rule, onEdit, onDelete, isDeleting }: RuleCardProps) {
  return (
    <div className="group flex items-start justify-between gap-3 p-4 border rounded-lg hover:shadow-sm hover:border-primary/20 transition-all bg-card">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm">{rule.title}</h4>
          </div>
          {rule.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rule.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(rule)}
          disabled={isDeleting}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(rule)}
          disabled={isDeleting}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
