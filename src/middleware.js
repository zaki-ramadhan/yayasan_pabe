import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("pabe_session")?.value || request.cookies.get("ygsm_session")?.value;

  // 1. Guard client portal pages (/donatur/*)
  if (pathname.startsWith("/donatur")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Attach strict anti-leak & anti-index headers
    const response = NextResponse.next();
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex"
    );
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  // 2. Guard user-specific API endpoints (/api/user/*)
  if (pathname.startsWith("/api/user")) {
    if (!session) {
      return NextResponse.json(
        { error: "Akses tidak sah. Silakan masuk terlebih dahulu." },
        { status: 401 }
      );
    }

    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/donatur/:path*", "/api/user/:path*"],
};
