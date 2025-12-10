import { createClient } from "@/lib/supabase/server";
import { insertStoreItemSchema } from "@/db/schema";
import { fromError } from "zod-validation-error";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  
  const supabase = await createClient();
  let query = supabase.from("store_items").select("*");
  
  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertStoreItemSchema.parse(body);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_items")
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: fromError(error).toString() }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create store item" }, { status: 500 });
  }
}
