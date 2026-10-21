import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const session =
    request.cookies.get("pabe_session")?.value ||
    request.cookies.get("ygsm_session")?.value;

  // 1. Reverse Guard: If already authenticated, redirect away from /login & /register
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/donatur/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. Guard Admin Portal Pages (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  // 3. Guard Client Portal Pages (/donatur and /donatur/*)
  if (pathname === "/donatur" || pathname.startsWith("/donatur/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  // 4. Guard Sensitive Internal API Endpoints (/api/dashboard/* and /api/user/*)
  if (pathname.startsWith("/api/user") || pathname.startsWith("/api/dashboard")) {
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses tidak sah. Silakan masuk terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/donatur",
    "/donatur/:path*",
    "/api/user/:path*",
    "/api/dashboard/:path*",
    "/login",
    "/register",
  ],
};
