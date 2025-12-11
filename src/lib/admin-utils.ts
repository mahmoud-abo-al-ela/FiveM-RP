import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";
import * as crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function getSupabase() {
  return createServiceRoleClient();
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const adminSessionId = cookieStore.get("admin_session")?.value;

  if (!adminSessionId) return null;

  const supabase = await getSupabase();

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id, username")
    .eq("id", adminSessionId)
    .eq("active", true)
    .single();

  return admin;
}
