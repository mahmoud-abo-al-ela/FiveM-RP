import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface StoreItem {
  id: number;
  category: string;
  name: string;
  description: string | null;
  price: string;
  metadata: string | null;
  image_url: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  stock: number;
}

export function useStoreMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (item: Partial<StoreItem>) => {
      const res = await fetch("/api/admin/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create item");
      }
      return res.json();
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["admin-store-items"] });
      const previousItems = queryClient.getQueryData(["admin-store-items"]);
      const tempId = Date.now();
      const optimisticItem = {
        ...newItem,
        id: tempId,
      } as StoreItem;
      
      queryClient.setQueryData(["admin-store-items"], (old: StoreItem[] = []) => 
        [optimisticItem, ...old]
      );
      
      toast.loading(`Creating "${newItem.name}"...`, {
        id: "create-store-item",
      });
      
      return { previousItems, tempId };
    },
    onSuccess: (data, variables) => {
      toast.dismiss("create-store-item");
      const itemName = data?.name || variables?.name || "Item";
      toast.success("Store item created", {
        description: `"${itemName}" is now available in the store`,
        duration: 3000,
      });
    },
    onError: (error: Error, _variables, context) => {
      toast.dismiss("create-store-item");
      if (context?.previousItems) {
        queryClient.setQueryData(["admin-store-items"], context.previousItems);
      }
      toast.error("Failed to create item", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-items"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (item: StoreItem) => {
      const res = await fetch("/api/admin/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update item");
      }
      return res.json();
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["admin-store-items"] });
      const previousItems = queryClient.getQueryData(["admin-store-items"]);
      
      queryClient.setQueryData(["admin-store-items"], (old: StoreItem[] = []) => 
        old.map((item) => item.id === updatedItem.id ? updatedItem : item)
      );
      
      toast.loading(`Updating "${updatedItem.name}"...`, {
        id: `update-${updatedItem.id}`,
      });
      
      return { previousItems };
    },
    onSuccess: (data, variables) => {
      toast.dismiss(`update-${variables.id}`);
      const itemName = data?.name || variables?.name || "Item";
      toast.success("Store item updated", {
        description: `"${itemName}" changes have been saved`,
        duration: 3000,
      });
    },
    onError: (error: Error, variables, context) => {
      toast.dismiss(`update-${variables.id}`);
      if (context?.previousItems) {
        queryClient.setQueryData(["admin-store-items"], context.previousItems);
      }
      toast.error("Failed to update item", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-items"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/store?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete item");
      }
      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["admin-store-items"] });
      const previousItems = queryClient.getQueryData(["admin-store-items"]);
      const items = queryClient.getQueryData<StoreItem[]>(["admin-store-items"]) || [];
      const deletedItem = items.find((i) => i.id === deletedId);
      
      toast.loading(`Deleting "${deletedItem?.name || 'item'}"...`, {
        id: `delete-${deletedId}`,
      });
      
      return { previousItems, deletedItem };
    },
    onSuccess: (_data, deletedId, context) => {
      toast.dismiss(`delete-${deletedId}`);
      queryClient.setQueryData(["admin-store-items"], (old: StoreItem[] = []) => 
        old.filter((item) => item.id !== deletedId)
      );
      toast.success("Store item deleted", {
        description: context?.deletedItem ? `"${context.deletedItem.name}" has been permanently removed` : "The item has been removed",
        duration: 3000,
      });
    },
    onError: (error: Error, deletedId, context) => {
      toast.dismiss(`delete-${deletedId}`);
      if (context?.previousItems) {
        queryClient.setQueryData(["admin-store-items"], context.previousItems);
      }
      toast.error("Failed to delete item", {
        description: error.message,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-items"] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
