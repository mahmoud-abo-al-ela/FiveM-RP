import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request: { headers: request.headers } });

  // 1. Public API routes and assets (no auth required)
  const publicApiRoutes = [
    "/api/auth/activate",
    "/api/auth/sync-user",
    "/api/auth/check-profile",
    "/api/auth/callback",
    "/api/discord/interactions",
    "/api/auth/admin/verify",
    // Guest-accessible API routes
    "/api/events",
    "/api/leaderboard",
    "/api/rules",
    "/api/store",
    "/api/server-status",
  ];

  // SEO and metadata files (always public)
  const seoFiles = [
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.webmanifest",
    "/favicon.ico",
    "/site.webmanifest",
  ];

  if (
    publicApiRoutes.some((route) => pathname.startsWith(route)) ||
    seoFiles.some((file) => pathname === file) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return response;
  }

  // 2. Initialize Supabase client with cookie support
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Detect auth cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1];
  const authCookieName = `sb-${projectId}-auth-token`;
  const hasAuthCookie = request.cookies.getAll().some((c) =>
    c.name.startsWith(authCookieName)
  );

  let user = null;
  if (hasAuthCookie) {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (!error && authUser) user = authUser;
  }

  // 4. Public pages accessible to guests (no auth required)
  const publicPages = [
    "/auth/signin",
    "/auth/callback",
    "/auth/error",
    "/auth/admin",
  ];

  const guestAccessiblePages = [
    "/",
    "/events",
    "/leaderboard",
    "/rules",
    "/store",
  ];

  if (!user) {
    // Allow auth pages
    if (publicPages.some((page) => pathname === page || pathname.startsWith(page + "/"))) {
      return response;
    }
    // Allow guest-accessible public pages
    if (
      guestAccessiblePages.some(
        (page) => pathname === page || (page !== "/" && pathname.startsWith(page + "/"))
      )
    ) {
      return response;
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // 5. Fetch user profile from Supabase
  let userProfile = null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role, display_name, in_game_name, activated, rejected_at")
      .eq("id", user.id)
      .single();

    if (!error && data) userProfile = data;
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }

  const isAdmin = userProfile?.role === "admin";

  // 6. Admin route protection
  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 7. Profile and activation flow for regular users
  if (!isAdmin && userProfile) {
    const hasProfile = userProfile.display_name && userProfile.in_game_name;

    // User has NO profile: can only access /auth/activate
    if (!hasProfile && pathname !== "/auth/activate") {
      return NextResponse.redirect(new URL("/auth/activate", request.url));
    }

    // User has profile but NOT activated: can only access /auth/pending
    if (hasProfile && !userProfile.activated && pathname !== "/auth/pending") {
      const status = userProfile.rejected_at ? "rejected" : "pending";
      return NextResponse.redirect(new URL(`/auth/pending?status=${status}`, request.url));
    }

    // Activated users: block access to /auth/activate and /auth/pending
    if (
      userProfile.activated &&
      (pathname === "/auth/activate" || pathname.startsWith("/auth/pending"))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 8. Redirect logged-in users away from signin
  if (pathname.startsWith("/auth/signin")) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
