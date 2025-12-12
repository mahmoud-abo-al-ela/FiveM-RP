import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages (no login required)
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/callback",
    "/auth/error",
    "/auth/admin", // must always be open
  ];

  // Public API endpoints
  const publicApiRoutes = [
    "/api/auth/activate",
    "/api/auth/sync-user",
    "/api/auth/check-profile",
    "/api/auth/callback",
    "/api/discord/interactions",
    "/api/rules",
  ];

  // Skip proxy for public API + static files
  if (
    publicApiRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/auth/admin")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Initialize Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /* ----------------------------------------------------------------------------------------
     ADMIN SESSION COOKIE (MUST BE FIRST PRIORITY)
  ---------------------------------------------------------------------------------------- */

  const adminSessionCookie = request.cookies.get("admin_session");

  if (adminSessionCookie?.value) {
    // Allow full access to /admin and /api/admin
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      return response;
    }
  }

  // Always allow access to admin login page BEFORE user activation checks
  if (pathname.startsWith("/auth/admin")) {
    return response;
  }

  /* ----------------------------------------------------------------------------------------
     AUTHENTICATION CHECK
  ---------------------------------------------------------------------------------------- */

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user has NO auth session
  if (!session) {
    // Allow true public pages
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return response;
    }

    // Accessing /admin without admin cookie → send to admin login
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/admin", request.url));
    }

    // Normal user → send to signin
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  /* ----------------------------------------------------------------------------------------
     USER IS AUTHENTICATED → DO NOT ALLOW SIGNIN OR ADMIN LOGIN
  ---------------------------------------------------------------------------------------- */

  if (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  /* ----------------------------------------------------------------------------------------
     PROFILE & ACTIVATION LOGIC
  ---------------------------------------------------------------------------------------- */

  try {
    const { data: profile } = await supabase
      .from("users")
      .select("display_name, in_game_name, activated, rejected_at, role")
      .eq("id", session.user.id)
      .single();

    // ADMIN ROLE from Supabase users table
    if (profile?.role === "admin") {
      return response; // full access
    }

    const hasProfile =
      profile?.display_name && profile?.in_game_name;

    // User did NOT complete required profile → lock to /auth/activate
    if (!hasProfile) {
      if (pathname.startsWith("/auth/activate")) {
        return response;
      }
      return NextResponse.redirect(new URL("/auth/activate", request.url));
    }

    // Profile exists but not yet approved → lock to /auth/pending
    if (!profile.activated) {
      if (pathname.startsWith("/auth/pending")) {
        return response;
      }

      const status = profile.rejected_at ? "rejected" : "pending";
      return NextResponse.redirect(
        new URL(`/auth/pending?status=${status}`, request.url)
      );
    }

    // Activated user → block them from auth pages
    if (
      pathname.startsWith("/auth/pending") ||
      pathname.startsWith("/auth/activate") ||
      pathname.startsWith("/auth/signin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
