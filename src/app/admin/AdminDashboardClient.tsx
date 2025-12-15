"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingBag, Calendar, Shield, Activity, UserCog, BookOpen, ShieldCheck, type LucideIcon } from "lucide-react";
import { ActivationQueue } from "@/components/admin/ActivationQueue";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { StoreManagement } from "@/components/admin/StoreManagement";
import { EventsManagement } from "@/components/admin/EventsManagement";
import { ServerManagement } from "@/components/admin/ServerManagement";
import { AdminsManagement } from "@/components/admin/AdminsManagement";
import { RulesManagement } from "@/components/admin/RulesManagement";
import Loading from "../loading";

interface StatCard {
  title: string;
  icon: LucideIcon;
  value: number;
  subtitle: string;
}

interface Tab {
  value: string;
  label: string;
  icon: LucideIcon;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  { value: "activations", label: "Activations", icon: Shield, component: ActivationQueue },
  { value: "users", label: "Users", icon: Users, component: UsersManagement },
  { value: "admins", label: "Admins", icon: UserCog, component: AdminsManagement },
  { value: "events", label: "Events", icon: Calendar, component: EventsManagement },
  { value: "rules", label: "Rules", icon: BookOpen, component: RulesManagement },
  { value: "store", label: "Store", icon: ShoppingBag, component: StoreManagement },
  { value: "server", label: "Server", icon: Activity, component: ServerManagement },
];

export default function AdminDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "activations";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const statCards: StatCard[] = useMemo(() => [
    {
      title: "Total Users",
      icon: Users,
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.activeUsers || 0} active`,
    },
    {
      title: "Total Admins",
      icon: ShieldCheck,
      value: stats?.totalAdmins || 0,
      subtitle: "Admin accounts",
    },
    {
      title: "Pending Activations",
      icon: Shield,
      value: stats?.pendingActivations || 0,
      subtitle: "Awaiting approval",
    },
    {
      title: "Store Items",
      icon: ShoppingBag,
      value: stats?.storeItems ?? 0,
      subtitle: `${stats?.availableItems ?? 0} available`,
    },
  ], [stats]);

  useEffect(() => {
    if (!searchParams.get("tab")) {
      router.replace("/admin?tab=activations");
    }
  }, [searchParams, router]);

  const handleTabChange = (value: string) => {
    router.push(`/admin?tab=${value}`);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container mx-auto py-8 px-4">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map(({ title, icon: Icon, value, subtitle }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="hover:text-gray-200 cursor-pointer">
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value, component: Component }) => (
          <TabsContent key={value} value={value}>
            <Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
