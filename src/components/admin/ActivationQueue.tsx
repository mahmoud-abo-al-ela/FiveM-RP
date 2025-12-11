"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivationsEmptyState } from "./empty-states";
import { DataPagination } from "@/components/ui/data-pagination";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

interface PendingUser {
  id: string;
  display_name: string;
  in_game_name: string;
  bio: string | null;
  created_at: string;
  discord_username: string | null;
  discord_avatar: string | null;
}

export function ActivationQueue() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ["pending-activations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/activations");
      if (!res.ok) throw new Error("Failed to fetch pending activations");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin/activations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-activations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User approved successfully");
    },
    onError: () => {
      toast.error("Failed to approve user");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/admin/activations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-activations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User rejected");
    },
    onError: () => {
      toast.error("Failed to reject user");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Queue</CardTitle>
        <CardDescription>
          Review and approve user registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <ActivationsEmptyState />
        ) : (
          <>
            <div className="space-y-4">
              {pendingUsers
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((user: PendingUser) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.discord_avatar || undefined} />
                    <AvatarFallback>
                      {user.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{user.display_name}</div>
                    <div className="text-sm text-muted-foreground">
                      In-game: {user.in_game_name}
                    </div>
                    {user.discord_username && (
                      <div className="text-xs text-muted-foreground">
                        Discord: {user.discord_username}
                      </div>
                    )}
                    {user.bio && (
                      <div className="text-sm mt-2 max-w-md">{user.bio}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => approveMutation.mutate(user.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(user.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
                ))}
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={Math.ceil(pendingUsers.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
