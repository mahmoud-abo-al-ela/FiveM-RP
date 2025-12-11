import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Rule } from "./types";

export function useRuleMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Rule>) => {
      const res = await fetch("/api/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create rule");
      }
      return res.json();
    },
    onMutate: async (newRule) => {
      await queryClient.cancelQueries({ queryKey: ["rules"] });
      const previousRules = queryClient.getQueryData(["rules"]);
      
      toast.loading(`Creating "${newRule.title}"...`, {
        id: "create-rule",
      });
      
      return { previousRules };
    },
    onSuccess: (data, variables) => {
      toast.dismiss("create-rule");
      const ruleTitle = data?.title || variables?.title || "Rule";
      toast.success("Rule created", {
        description: `"${ruleTitle}" is now active`,
        duration: 3000,
      });
    },
    onError: (error: Error, _variables, context) => {
      toast.dismiss("create-rule");
      if (context?.previousRules) {
        queryClient.setQueryData(["rules"], context.previousRules);
      }
      toast.error("Failed to create rule", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Rule> & { id: number }) => {
      const res = await fetch(`/api/admin/rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update rule");
      }
      return res.json();
    },
    onMutate: async (updatedRule) => {
      await queryClient.cancelQueries({ queryKey: ["rules"] });
      const previousRules = queryClient.getQueryData(["rules"]);
      
      queryClient.setQueryData(["rules"], (old: Rule[] = []) => 
        old.map((rule) => rule.id === updatedRule.id ? { ...rule, ...updatedRule } : rule)
      );
      
      toast.loading(`Updating "${updatedRule.title}"...`, {
        id: `update-rule-${updatedRule.id}`,
      });
      
      return { previousRules };
    },
    onSuccess: (data, variables) => {
      toast.dismiss(`update-rule-${variables.id}`);
      const ruleTitle = data?.title || variables?.title || "Rule";
      toast.success("Rule updated", {
        description: `"${ruleTitle}" changes have been saved`,
        duration: 3000,
      });
    },
    onError: (error: Error, variables, context) => {
      toast.dismiss(`update-rule-${variables.id}`);
      if (context?.previousRules) {
        queryClient.setQueryData(["rules"], context.previousRules);
      }
      toast.error("Failed to update rule", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/rules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete rule");
      }
      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["rules"] });
      const previousRules = queryClient.getQueryData(["rules"]);
      const rules = queryClient.getQueryData<Rule[]>(["rules"]) || [];
      const deletedRule = rules.find((r) => r.id === deletedId);
      
      toast.loading(`Deleting "${deletedRule?.title || 'rule'}"...`, {
        id: `delete-rule-${deletedId}`,
      });
      
      return { previousRules, deletedRule };
    },
    onSuccess: (_data, deletedId, context) => {
      toast.dismiss(`delete-rule-${deletedId}`);
      queryClient.setQueryData(["rules"], (old: Rule[] = []) => 
        old.filter((rule) => rule.id !== deletedId)
      );
      toast.success("Rule deleted", {
        description: context?.deletedRule ? `"${context.deletedRule.title}" has been permanently removed` : "The rule has been removed",
        duration: 3000,
      });
    },
    onError: (error: Error, deletedId, context) => {
      toast.dismiss(`delete-rule-${deletedId}`);
      if (context?.previousRules) {
        queryClient.setQueryData(["rules"], context.previousRules);
      }
      toast.error("Failed to delete rule", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
