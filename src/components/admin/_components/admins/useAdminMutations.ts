import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAdminMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string; email?: string }) => {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create admin");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
      toast.success("Admin created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { adminId: string; newPassword: string }) => {
      const res = await fetch("/api/admin/admins/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const res = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
      toast.success("Admin deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete admin");
    },
  });

  return { createMutation, updatePasswordMutation, deleteMutation };
}
