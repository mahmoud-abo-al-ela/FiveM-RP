"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AdminRow, AdminUser } from "./_components/admins/AdminRow";
import { RevokeAdminDialog } from "./_components/admins/RevokeAdminDialog";



export function AdminsManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user ID
  useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Failed to fetch current user");
      const data = await res.json();
      setCurrentUserId(data.id);
      return data;
    },
  });

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-admins", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("role", "admin");
      params.append("includeProtected", "true"); // Include protected admins in admins page
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch admins");
      return res.json();
    },
  });

  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: "user" }),
      });
      if (!res.ok) throw new Error("Failed to revoke admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Admin role revoked successfully");
      setIsRevokeDialogOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error("Failed to revoke admin role");
    },
  });

  const handleRevokeClick = (admin: AdminUser) => {
    setSelectedUser(admin);
    setIsRevokeDialogOpen(true);
  };

  const handleConfirmRevoke = () => {
    if (selectedUser) {
      revokeAdminMutation.mutate(selectedUser.id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Admin Users Management</CardTitle>
          <CardDescription>
            Manage users with admin privileges. Use the Users tab to promote users to admin.
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admin users found</p>
              <p className="text-sm mt-2">Promote users to admin from the Users tab</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin: AdminUser) => (
                <AdminRow
                  key={admin.id}
                  admin={admin}
                  currentUserId={currentUserId}
                  onRevoke={handleRevokeClick}
                  isRevoking={revokeAdminMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RevokeAdminDialog
        open={isRevokeDialogOpen}
        onOpenChange={setIsRevokeDialogOpen}
        admin={selectedUser}
        onConfirm={handleConfirmRevoke}
      />
    </>
  );
}
