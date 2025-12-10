import { createClient } from "@/lib/supabase/server";
import { insertNewsArticleSchema } from "@/db/schema";
import { fromError } from "zod-validation-error";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertNewsArticleSchema.parse(body);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_articles")
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
    return NextResponse.json({ error: "Failed to create news article" }, { status: 500 });
  }
}
