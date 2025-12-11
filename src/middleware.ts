import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that anyone can access (no auth required)
  const publicRoutes = [
    "/",
    "/rules",
    "/auth/signin",
    "/auth/callback",
    "/auth/error",
    "/auth/admin",
  ];

  // API routes that don't need activation check
  const publicApiRoutes = [
    "/api/auth/activate",
    "/api/auth/sync-user",
    "/api/auth/check-profile",
    "/api/auth/callback",
    "/api/discord/interactions", // Discord webhook endpoint (no auth needed)
  ];

  // Skip middleware for public API routes and static files
  if (
    publicApiRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/admin")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // For all routes, check authentication first
  if (!session) {
    // Allow access to public routes for non-authenticated users
    if (publicRoutes.some((route) => pathname === route)) {
      return response;
    }
    // Redirect to signin for protected routes
    const redirectUrl = new URL("/auth/signin", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // User is authenticated - check activation status
  try {
    const { data: profile } = await supabase
      .from("users")
      .select("display_name, in_game_name, activated, rejected_at, role")
      .eq("id", session.user.id)
      .single();

    // Admin users bypass activation check and can access everything
    if (profile?.role === "admin") {
      return response;
    }

    const hasProfile = profile && profile.display_name && profile.in_game_name;

    // Case 1: User has NO profile - LOCKED to /auth/activate ONLY
    if (!hasProfile) {
      if (pathname.startsWith("/auth/activate")) {
        return response; // Allow access to activation form
      }
      // Redirect to activation form for ANY other page
      return NextResponse.redirect(new URL("/auth/activate", request.url));
    }

    // Case 2: User has profile but NOT activated (pending) - LOCKED to /auth/pending ONLY
    if (hasProfile && !profile.activated) {
      if (pathname.startsWith("/auth/pending")) {
        return response; // Allow access to pending page
      }
      // Redirect to pending page for ANY other page (including public routes)
      const status = profile.rejected_at ? "rejected" : "pending";
      return NextResponse.redirect(new URL(`/auth/pending?status=${status}`, request.url));
    }

    // Case 3: User is activated - can access all pages
    if (profile.activated) {
      if (pathname.startsWith("/auth/pending") || pathname.startsWith("/auth/activate")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      // Allow access to all other pages
      return response;
    }

    // Fallback - allow access
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed to avoid breaking the app
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
