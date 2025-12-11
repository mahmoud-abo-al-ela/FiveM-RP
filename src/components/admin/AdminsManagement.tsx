"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AdminCard, CreateAdminDialog, PasswordDialog, useAdminMutations } from "./_components/admins";

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  created_at: string;
  last_login: string | null;
  active: boolean;
}

export function AdminsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: async () => {
      const res = await fetch("/api/admin/admins");
      if (!res.ok) throw new Error("Failed to fetch admins");
      return res.json();
    },
  });

  const { createMutation, updatePasswordMutation, deleteMutation } = useAdminMutations();

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate(
      {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        email: (formData.get("email") as string) || undefined,
      },
      {
        onSuccess: () => setIsCreateDialogOpen(false),
      }
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    updatePasswordMutation.mutate(
      {
        adminId: selectedAdmin.id,
        newPassword,
      },
      {
        onSuccess: () => {
          setIsPasswordDialogOpen(false);
          setSelectedAdmin(null);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admin Users Management</CardTitle>
            <CardDescription>Manage administrator accounts and permissions</CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin: AdminUser) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                onChangePassword={(admin) => {
                  setSelectedAdmin(admin);
                  setIsPasswordDialogOpen(true);
                }}
                onDelete={(admin) => deleteMutation.mutate(admin.id)}
              />
            ))}
          </div>
        )}

        <CreateAdminDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateSubmit}
          isCreating={createMutation.isPending}
        />

        <PasswordDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          admin={selectedAdmin}
          onSubmit={handlePasswordSubmit}
          isUpdating={updatePasswordMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
