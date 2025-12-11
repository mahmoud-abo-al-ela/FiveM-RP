import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RuleCategory } from "./types";

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<RuleCategory>) => {
      const res = await fetch("/api/admin/rules/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create category");
      }
      return res.json();
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ["rule-categories"] });
      const previousCategories = queryClient.getQueryData(["rule-categories"]);
      
      toast.loading(`Creating "${newCategory.name}"...`, {
        id: "create-category",
      });
      
      return { previousCategories };
    },
    onSuccess: (data, variables) => {
      toast.dismiss("create-category");
      const categoryName = data?.name || variables?.name || "Category";
      toast.success("Category created", {
        description: `"${categoryName}" is now available`,
        duration: 3000,
      });
    },
    onError: (error: Error, _variables, context) => {
      toast.dismiss("create-category");
      if (context?.previousCategories) {
        queryClient.setQueryData(["rule-categories"], context.previousCategories);
      }
      toast.error("Failed to create category", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rule-categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RuleCategory> & { id: number }) => {
      const res = await fetch(`/api/admin/rules/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update category");
      }
      return res.json();
    },
    onMutate: async (updatedCategory) => {
      await queryClient.cancelQueries({ queryKey: ["rule-categories"] });
      const previousCategories = queryClient.getQueryData(["rule-categories"]);
      
      queryClient.setQueryData(["rule-categories"], (old: RuleCategory[] = []) => 
        old.map((cat) => cat.id === updatedCategory.id ? { ...cat, ...updatedCategory } : cat)
      );
      
      toast.loading(`Updating "${updatedCategory.name}"...`, {
        id: `update-category-${updatedCategory.id}`,
      });
      
      return { previousCategories };
    },
    onSuccess: (data, variables) => {
      toast.dismiss(`update-category-${variables.id}`);
      const categoryName = data?.name || variables?.name || "Category";
      toast.success("Category updated", {
        description: `"${categoryName}" changes have been saved`,
        duration: 3000,
      });
    },
    onError: (error: Error, variables, context) => {
      toast.dismiss(`update-category-${variables.id}`);
      if (context?.previousCategories) {
        queryClient.setQueryData(["rule-categories"], context.previousCategories);
      }
      toast.error("Failed to update category", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rule-categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/rules/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete category");
      }
      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["rule-categories"] });
      const previousCategories = queryClient.getQueryData(["rule-categories"]);
      const categories = queryClient.getQueryData<RuleCategory[]>(["rule-categories"]) || [];
      const deletedCategory = categories.find((c) => c.id === deletedId);
      
      toast.loading(`Deleting "${deletedCategory?.name || 'category'}"...`, {
        id: `delete-category-${deletedId}`,
      });
      
      return { previousCategories, deletedCategory };
    },
    onSuccess: (_data, deletedId, context) => {
      toast.dismiss(`delete-category-${deletedId}`);
      queryClient.setQueryData(["rule-categories"], (old: RuleCategory[] = []) => 
        old.filter((cat) => cat.id !== deletedId)
      );
      toast.success("Category deleted", {
        description: context?.deletedCategory ? `"${context.deletedCategory.name}" has been permanently removed` : "The category has been removed",
        duration: 3000,
      });
    },
    onError: (error: Error, deletedId, context) => {
      toast.dismiss(`delete-category-${deletedId}`);
      if (context?.previousCategories) {
        queryClient.setQueryData(["rule-categories"], context.previousCategories);
      }
      toast.error("Failed to delete category", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rule-categories"] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
