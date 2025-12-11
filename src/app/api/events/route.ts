import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        created_by:users!events_created_by_fkey(discord_username, discord_avatar),
        participants:event_participants(count)
      `)
      .gte("expiration_date", new Date().toISOString())
      .order("event_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        event_date: body.event_date,
        expiration_date: body.expiration_date,
        created_by: body.created_by,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
