import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    let query = supabase
      .from("rules")
      .select("*")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data: rules, error } = await query;

    if (error) throw error;

    return NextResponse.json(rules || []);
  } catch (error: any) {
    console.error("Error fetching public rules:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
