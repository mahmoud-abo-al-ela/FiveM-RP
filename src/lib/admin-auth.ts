import { createClient } from "@/lib/supabase/server";

export async function verifyAdminSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  const { data: admin } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .eq("role", "admin")
    .single();

  return admin;
}

export async function isAdminUser(): Promise<boolean> {
  const admin = await verifyAdminSession();
  return admin !== null;
}
