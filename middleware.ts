import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 1. Public API routes and assets (no auth required)
  const publicApiRoutes = [
    "/api/auth/activate",
    "/api/auth/sync-user",
    "/api/auth/check-profile",
    "/api/auth/callback",
    "/api/discord/interactions",
    "/api/auth/admin/verify",
  ];

  if (
    publicApiRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
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

  // 4. Public pages (accessible without authentication)
  const publicPages = [
    "/",
    "/events",
    "/leaderboard",
    "/store",
    "/rules",
    "/auth/signin",
    "/auth/callback",
    "/auth/error",
    "/auth/admin",
  ];

  // 5. Redirect unauthenticated users (except for public pages)
  if (!user) {
    if (publicPages.some((page) => pathname === page || pathname.startsWith(page + "/"))) {
      return response; // allow public pages
    }

    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // 6. Fetch user profile from Supabase
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

  // 7. Admin route protection
  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 8. Redirect logged-in users away from signin page
  if (pathname.startsWith("/auth/signin")) {
    if (isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 9. Profile activation flow for regular users
  if (!isAdmin && userProfile) {
    const hasProfile = userProfile.display_name && userProfile.in_game_name;

    // Profile completion check
    if (!hasProfile && !pathname.startsWith("/auth/activate")) {
      return NextResponse.redirect(new URL("/auth/activate", request.url));
    }

    // Activation check
    if (!userProfile.activated) {
      if (!pathname.startsWith("/auth/pending")) {
        const status = userProfile.rejected_at ? "rejected" : "pending";
        return NextResponse.redirect(
          new URL(`/auth/pending?status=${status}`, request.url)
        );
      }
    }

    // Prevent activated users from accessing activation/pending pages
    if (
      userProfile.activated &&
      (pathname.startsWith("/auth/activate") || pathname.startsWith("/auth/pending"))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
