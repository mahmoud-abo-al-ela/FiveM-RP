import { createClient } from "@/lib/supabase/server";
import { insertServerStatusSchema } from "@/db/schema";
import { fromError } from "zod-validation-error";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("server_status")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // filter "no rows found" error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      online: true,
      currentPlayers: 124,
      maxPlayers: 200,
      ping: 14
    });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = insertServerStatusSchema.parse(body);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("server_status")
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
    return NextResponse.json({ error: "Failed to update server status" }, { status: 500 });
  }
}
