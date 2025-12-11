"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Activity, Users, Wifi, WifiOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ServerManagement() {
  const queryClient = useQueryClient();

  const { data: serverStatus, isLoading } = useQuery({
    queryKey: ["admin-server-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/server");
      if (!res.ok) throw new Error("Failed to fetch server status");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/server", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update server status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-server-status"] });
      toast.success("Server status updated");
    },
    onError: () => {
      toast.error("Failed to update server status");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      online: formData.get("online") === "on",
      current_players: parseInt(formData.get("current_players") as string),
      max_players: parseInt(formData.get("max_players") as string),
      ping: parseInt(formData.get("ping") as string),
    };
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
          <CardDescription>Monitor and update server status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {serverStatus?.online ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serverStatus?.online ? "Online" : "Offline"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {serverStatus?.current_players || 0}/{serverStatus?.max_players || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ping</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serverStatus?.ping || 0}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Update</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {serverStatus?.updated_at
                    ? new Date(serverStatus.updated_at).toLocaleTimeString()
                    : "N/A"}
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="online"
                name="online"
                defaultChecked={serverStatus?.online}
              />
              <Label htmlFor="online">Server Online</Label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="current_players">Current Players</Label>
                <Input
                  id="current_players"
                  name="current_players"
                  type="number"
                  defaultValue={serverStatus?.current_players || 0}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="max_players">Max Players</Label>
                <Input
                  id="max_players"
                  name="max_players"
                  type="number"
                  defaultValue={serverStatus?.max_players || 200}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="ping">Ping (ms)</Label>
                <Input
                  id="ping"
                  name="ping"
                  type="number"
                  defaultValue={serverStatus?.ping || 0}
                  min="0"
                />
              </div>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              Update Server Status
            </Button>
          </form>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
