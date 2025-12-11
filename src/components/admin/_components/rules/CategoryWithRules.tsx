import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Edit, Trash2, Loader2, Plus, ChevronDown, Folder, GripVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RuleCategory, Rule } from "./types";
import { SortableRuleCard } from "./SortableRuleCard";

interface CategoryWithRulesProps {
  category: RuleCategory;
  rules: Rule[];
  onEditCategory: (category: RuleCategory) => void;
  onDeleteCategory: (category: RuleCategory) => void;
  onAddRule: (categoryId: number) => void;
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (rule: Rule) => void;
  onRuleDragEnd: (event: DragEndEvent) => void;
  isDeletingCategory?: boolean;
  deletingRuleId?: number | null;
}

export function CategoryWithRules({
  category,
  rules,
  onEditCategory,
  onDeleteCategory,
  onAddRule,
  onEditRule,
  onDeleteRule,
  onRuleDragEnd,
  isDeletingCategory,
  deletingRuleId,
}: CategoryWithRulesProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryRules = rules
    .filter((r) => r.category_id === category.id)
    .sort((a, b) => a.display_order - b.display_order);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get the icon component dynamically
  const IconComponent = category.icon && (LucideIcons as any)[category.icon] 
    ? (LucideIcons as any)[category.icon] 
    : Folder;

  return (
    <Card ref={setNodeRef} style={style} className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              className="mt-1 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
            </button>
            <div className="mt-1">
              <IconComponent 
                className="h-5 w-5 transition-colors" 
                style={{ color: category.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <CardTitle 
                  className="text-lg font-semibold"
                  style={{ color: category.color }}
                >
                  {category.name}
                </CardTitle>
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
              onClick={() => onEditCategory(category)}
              disabled={isDeletingCategory}
              className="h-8 w-8"
              title="Edit category"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteCategory(category)}
              disabled={isDeletingCategory}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              title="Delete category"
            >
              {isDeletingCategory ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="border-t pt-3">
          <div className="flex items-center justify-between mb-3">
            <CollapsibleTrigger asChild>
              <button
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                <span>Rules ({categoryRules.length})</span>
              </button>
            </CollapsibleTrigger>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddRule(category.id)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Rule
            </Button>
          </div>

          <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            {categoryRules.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                No rules in this category yet
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onRuleDragEnd}
              >
                <SortableContext
                  items={categoryRules.map((rule) => rule.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {categoryRules.map((rule) => (
                      <SortableRuleCard
                        key={rule.id}
                        rule={rule}
                        onEdit={onEditRule}
                        onDelete={onDeleteRule}
                        isDeleting={deletingRuleId === rule.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
