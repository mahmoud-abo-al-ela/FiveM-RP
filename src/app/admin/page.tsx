"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingBag, Calendar, Shield, Activity, UserCog } from "lucide-react";
import { ActivationQueue } from "@/components/admin/ActivationQueue";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { StoreManagement } from "@/components/admin/StoreManagement";
import { EventsManagement } from "@/components/admin/EventsManagement";
import { ServerManagement } from "@/components/admin/ServerManagement";
import { AdminsManagement } from "@/components/admin/AdminsManagement";
import Loading from "../loading";

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling even when tab is not focused
  });

  useEffect(() => {
    if (!currentTab) {
      router.replace("/admin?tab=activations");
    }
  }, [currentTab, router]);

  const handleTabChange = (value: string) => {
    router.push(`/admin?tab=${value}`);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Complete control over your Website</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Activations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingActivations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Items</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.storeItems ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.availableItems ?? 0} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs value={currentTab || "activations"} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="activations" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <Shield className="h-4 w-4 mr-2" />
            Activations
          </TabsTrigger>
          <TabsTrigger value="users" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="admins" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <UserCog className="h-4 w-4 mr-2" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="store" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Store
          </TabsTrigger>
          <TabsTrigger value="events" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="server" className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
            <Activity className="h-4 w-4 mr-2" />
            Server
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activations">
          <ActivationQueue />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="admins">
          <AdminsManagement />
        </TabsContent>

        <TabsContent value="store">
          <StoreManagement />
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement />
        </TabsContent>

        <TabsContent value="server">
          <ServerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
