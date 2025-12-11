import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const adminSessionId = cookieStore.get("admin_session")?.value;

  if (!adminSessionId) {
    return null;
  }

  const supabase = createServiceRoleClient();
  const { data: admin } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", adminSessionId)
    .eq("active", true)
    .single();

  return admin;
}
