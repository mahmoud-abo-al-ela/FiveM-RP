import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
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

  // Protected routes that require authentication
  const protectedRoutes = ["/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to signin if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth/signin", request.url);
    redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user needs to complete activation
  if (session && !request.nextUrl.pathname.startsWith("/auth/")) {
    // Check if user has completed profile and activation status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name, in_game_name, activated, rejected_at")
      .eq("id", session.user.id)
      .single();

    const hasProfile = profile && profile.display_name && profile.in_game_name;

    // Redirect to activation if profile incomplete
    if (!hasProfile) {
      return NextResponse.redirect(new URL("/auth/activate", request.url));
    }

    // Check if user is activated
    if (hasProfile && !profile.activated) {
      // Check if rejected recently (within 24 hours)
      const rejectedAt = profile.rejected_at ? new Date(profile.rejected_at) : null;
      const now = new Date();
      const hoursSinceRejection = rejectedAt 
        ? (now.getTime() - rejectedAt.getTime()) / (1000 * 60 * 60)
        : 999;

      // If rejected within 24 hours, show waiting page
      if (rejectedAt && hoursSinceRejection < 24) {
        if (!request.nextUrl.pathname.startsWith("/auth/pending")) {
          return NextResponse.redirect(new URL("/auth/pending?status=rejected", request.url));
        }
      } else if (!request.nextUrl.pathname.startsWith("/auth/pending")) {
        // Otherwise, show pending approval page
        return NextResponse.redirect(new URL("/auth/pending?status=pending", request.url));
      }
    }

    // If activated, allow access and redirect from pending page
    if (profile.activated && request.nextUrl.pathname.startsWith("/auth/pending")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect to home if accessing auth pages with active session (except activate)
  if (
    (request.nextUrl.pathname.startsWith("/auth/signin") ||
      request.nextUrl.pathname.startsWith("/auth/error")) &&
    session
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
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
