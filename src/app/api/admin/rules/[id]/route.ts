import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const body = await request.json();
    const { id } = await params;

    console.log("Received body:", body);

    // Filter out undefined and null values
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (body.category_id !== undefined && body.category_id !== null) {
      updateData.category_id = parseInt(String(body.category_id));
    }
    if (body.title !== undefined && body.title !== null) {
      updateData.title = body.title;
    }
    if (body.description !== undefined && body.description !== null) {
      updateData.description = body.description;
    }
    if (body.display_order !== undefined && body.display_order !== null) {
      updateData.display_order = parseInt(String(body.display_order));
    }
    if (body.visible !== undefined && body.visible !== null) {
      updateData.visible = body.visible;
    }

    console.log("Update data:", updateData);

    const { data, error } = await supabase
      .from("rules")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating rule:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { id } = await params;

    const { error } = await supabase
      .from("rules")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting rule:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
