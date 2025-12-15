import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin-auth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const isAdmin = await isAdminUser();

  if (!isAdmin) {
    redirect("/");
  }

  return <AdminDashboardClient />;
}
