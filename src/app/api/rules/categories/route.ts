import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: categories, error } = await supabase
      .from("rule_categories")
      .select("*")
      .eq("visible", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(categories || []);
  } catch (error: any) {
    console.error("Error fetching public categories:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
