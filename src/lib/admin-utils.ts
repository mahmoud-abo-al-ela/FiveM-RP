import { createClient } from "@/lib/supabase/server";

export async function getSupabase() {
  return createClient();
}

export async function verifyAdminSession() {
  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: admin } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .eq("role", "admin")
    .single();

  return admin;
}
