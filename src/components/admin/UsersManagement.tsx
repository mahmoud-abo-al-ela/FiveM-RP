"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { UsersEmptyState } from "./empty-states";
import { DataPagination } from "@/components/ui/data-pagination";

const ITEMS_PER_PAGE = 10;

interface User {
  id: string;
  display_name: string;
  in_game_name: string;
  role: string;
  activated: boolean;
  level: number;
  discord_avatar: string | null;
  is_protected?: boolean;
}

export function UsersManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update role");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User role updated");
    },
    onError: (error: Error) => {
      if (error.message === "Cannot modify protected admin") {
        toast.error("This admin is protected and cannot be modified");
      } else {
        toast.error("Failed to update user role");
      }
    },
  });



  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
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
        ) : users.length === 0 ? (
          <UsersEmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {users
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((user: User) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.discord_avatar || undefined} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                      <div>
                        <div className="flex gap-2">

                        <div className="font-semibold">{user.display_name}</div>
                        <Badge 
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className={user.role === "admin" ? "bg-primary" : ""}
                      >
                        {user.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : null}
                        {user.role || "user"}
                      </Badge>
                        </div>
                    
                    <div className="flex gap-2 mt-1">
                      {user.role !== "admin" ? <div className="text-sm text-muted-foreground">
                      {user.in_game_name}
                          </div> : null}
                          {user.role !== "admin" ? <Badge variant="outline">
                        Level {user.level}
                      </Badge> : null}
                      
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role || "user"}
                    onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                    disabled={updateRoleMutation.isPending || user.id === currentUserId}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {user.id === currentUserId && (
                    <span className="text-xs text-muted-foreground">
                      (You)
                    </span>
                  )}
                </div>
              </div>
                ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={Math.ceil(users.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
