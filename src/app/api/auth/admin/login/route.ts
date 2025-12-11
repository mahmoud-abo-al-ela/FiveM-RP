import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as crypto from "crypto";

// Hash password using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    // Hash the provided password
    const hashedPassword = hashPassword(password);

    // Check if admin exists in admin_users table
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("password", hashedPassword)
      .eq("active", true)
      .single();

    if (error || !admin) {
      console.error("Admin login error:", error);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", admin.id);

    // Create admin session cookie
    const response = NextResponse.json({ 
      success: true, 
      admin: { username: admin.username, id: admin.id } 
    });
    
    // Set a secure session cookie
    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
