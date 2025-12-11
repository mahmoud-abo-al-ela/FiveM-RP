import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    let query = supabase
      .from("rules")
      .select("*, rule_categories(name, slug, icon, color)")
      .order("display_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data: rules, error } = await query;

    if (error) throw error;

    return NextResponse.json(rules || []);
  } catch (error: any) {
    console.error("Error fetching rules:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("rules")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating rule:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
