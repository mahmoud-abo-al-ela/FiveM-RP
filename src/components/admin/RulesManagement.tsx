"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, Loader2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RuleCategoriesEmptyState } from "./empty-states";
import {
  CategoryDialog,
  RuleDialog,
  CategoryWithRules,
  DeleteCategoryDialog,
  DeleteRuleDialog,
  useCategoryMutations,
  useRuleMutations,
  type RuleCategory,
  type Rule,
} from "./_components/rules";

export function RulesManagement() {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteRuleDialogOpen, setDeleteRuleDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(null);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<RuleCategory | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<RuleCategory[]>({
    queryKey: ["rule-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rules/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery<Rule[]>({
    queryKey: ["rules"],
    queryFn: async () => {
      const res = await fetch("/api/admin/rules");
      if (!res.ok) throw new Error("Failed to fetch rules");
      return res.json();
    },
  });

  const categoryMutations = useCategoryMutations();
  const ruleMutations = useRuleMutations();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      description: formData.get("description") as string,
      display_order: editingCategory?.display_order ?? categories.length,
    };

    setCategoryDialogOpen(false);
    setEditingCategory(null);

    if (editingCategory) {
      categoryMutations.updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      categoryMutations.createMutation.mutate(data);
    }
  };

  const handleRuleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const categoryId = parseInt(formData.get("category_id") as string);
    const categoryRules = rules.filter(r => r.category_id === categoryId);
    
    const data = {
      category_id: categoryId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      display_order: editingRule?.display_order ?? categoryRules.length,
    };

    setRuleDialogOpen(false);
    setEditingRule(null);
    setSelectedCategoryId(null);

    if (editingRule) {
      ruleMutations.updateMutation.mutate({ id: editingRule.id, ...data });
    } else {
      ruleMutations.createMutation.mutate(data);
    }
  };

  const handleDeleteCategory = (category: RuleCategory) => {
    setDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
    setDeletingCategoryId(category.id);
    categoryMutations.deleteMutation.mutate(category.id);
  };

  const handleDeleteRule = (rule: Rule) => {
    setDeleteRuleDialogOpen(false);
    setRuleToDelete(null);
    setDeletingRuleId(rule.id);
    ruleMutations.deleteMutation.mutate(rule.id);
  };

  const handleAddRule = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setEditingRule(null);
    setRuleDialogOpen(true);
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((cat) => cat.id === active.id);
      const newIndex = sortedCategories.findIndex((cat) => cat.id === over.id);

      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);

      // Optimistically update the UI
      queryClient.setQueryData(["rule-categories"], newOrder.map((cat, index) => ({
        ...cat,
        display_order: index,
      })));

      // Update all categories with new order
      try {
        const updatePromises = newOrder.map(async (cat, index) => {
          const response = await fetch(`/api/admin/rules/categories/${cat.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: index }),
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update category order");
          }
          return response.json();
        });
        
        await Promise.all(updatePromises);
        queryClient.invalidateQueries({ queryKey: ["rule-categories"] });
      } catch (error) {
        console.error("Failed to update category order:", error);
        queryClient.invalidateQueries({ queryKey: ["rule-categories"] });
      }
    }
  };

  const handleRuleDragEnd = async (categoryId: number, event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const categoryRules = rules
        .filter((r) => r.category_id === categoryId)
        .sort((a, b) => a.display_order - b.display_order);

      const oldIndex = categoryRules.findIndex((rule) => rule.id === active.id);
      const newIndex = categoryRules.findIndex((rule) => rule.id === over.id);

      const newOrder = arrayMove(categoryRules, oldIndex, newIndex);

      // Optimistically update the UI
      const updatedRules = rules.map((rule) => {
        const newOrderIndex = newOrder.findIndex((r) => r.id === rule.id);
        if (newOrderIndex !== -1) {
          return { ...rule, display_order: newOrderIndex };
        }
        return rule;
      });

      queryClient.setQueryData(["rules"], updatedRules);

      // Update all rules with new order
      try {
        const updatePromises = newOrder.map(async (rule, index) => {
          const response = await fetch(`/api/admin/rules/${rule.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: index }),
          });
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update rule order");
          }
          return response.json();
        });
        
        await Promise.all(updatePromises);
        queryClient.invalidateQueries({ queryKey: ["rules"] });
      } catch (error) {
        console.error("Failed to update rule order:", error);
        queryClient.invalidateQueries({ queryKey: ["rules"] });
      }
    }
  };

  const isLoading = categoriesLoading || rulesLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rules Management</CardTitle>
            <CardDescription>Manage rule categories and their rules. Drag to reorder.</CardDescription>
          </div>
          <Button onClick={() => {
            setEditingCategory(null);
            setCategoryDialogOpen(true);
          }}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <RuleCategoriesEmptyState onCreateClick={() => {
            setEditingCategory(null);
            setCategoryDialogOpen(true);
          }} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={sortedCategories.map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sortedCategories.map((category) => (
                  <CategoryWithRules
                    key={category.id}
                    category={category}
                    rules={rules}
                    onEditCategory={(cat) => {
                      setEditingCategory(cat);
                      setCategoryDialogOpen(true);
                    }}
                    onDeleteCategory={(cat) => {
                      setCategoryToDelete(cat);
                      setDeleteCategoryDialogOpen(true);
                    }}
                    onAddRule={handleAddRule}
                    onEditRule={(rule) => {
                      setEditingRule(rule);
                      setRuleDialogOpen(true);
                    }}
                    onDeleteRule={(rule) => {
                      setRuleToDelete(rule);
                      setDeleteRuleDialogOpen(true);
                    }}
                    onRuleDragEnd={(event) => handleRuleDragEnd(category.id, event)}
                    isDeletingCategory={deletingCategoryId === category.id}
                    deletingRuleId={deletingRuleId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <CategoryDialog
          open={categoryDialogOpen}
          onOpenChange={(open) => {
            setCategoryDialogOpen(open);
            if (!open) setEditingCategory(null);
          }}
          editingCategory={editingCategory}
          onSubmit={handleCategorySubmit}
          isSubmitting={categoryMutations.createMutation.isPending || categoryMutations.updateMutation.isPending}
        />

        <RuleDialog
          open={ruleDialogOpen}
          onOpenChange={(open) => {
            setRuleDialogOpen(open);
            if (!open) {
              setEditingRule(null);
              setSelectedCategoryId(null);
            }
          }}
          editingRule={editingRule}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSubmit={handleRuleSubmit}
          isSubmitting={ruleMutations.createMutation.isPending || ruleMutations.updateMutation.isPending}
        />

        <DeleteCategoryDialog
          open={deleteCategoryDialogOpen}
          onOpenChange={(open) => {
            setDeleteCategoryDialogOpen(open);
            if (!open) setCategoryToDelete(null);
          }}
          category={categoryToDelete}
          onConfirm={handleDeleteCategory}
          isDeleting={categoryMutations.deleteMutation.isPending}
        />

        <DeleteRuleDialog
          open={deleteRuleDialogOpen}
          onOpenChange={(open) => {
            setDeleteRuleDialogOpen(open);
            if (!open) setRuleToDelete(null);
          }}
          rule={ruleToDelete}
          onConfirm={handleDeleteRule}
          isDeleting={ruleMutations.deleteMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
