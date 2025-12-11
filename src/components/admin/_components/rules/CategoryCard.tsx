import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, EyeOff, Eye, GripVertical, Loader2 } from "lucide-react";
import { RuleCategory } from "./types";

interface CategoryCardProps {
  category: RuleCategory;
  onEdit: (category: RuleCategory) => void;
  onDelete: (category: RuleCategory) => void;
  isDeleting?: boolean;
}

export function CategoryCard({ category, onEdit, onDelete, isDeleting }: CategoryCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1">
              <GripVertical className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle 
                  className="text-lg font-semibold truncate"
                  style={{ color: category.color }}
                >
                  {category.name}
                </CardTitle>
                <Badge 
                  variant={category.visible ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {category.visible ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </>
                  )}
                </Badge>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              disabled={isDeleting}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(category)}
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
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
            <span className="font-medium">Slug:</span>
            <code className="font-mono">{category.slug}</code>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
            <span className="font-medium">Icon:</span>
            <span>{category.icon}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded">
            <span className="font-medium">Order:</span>
            <span>{category.display_order}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
