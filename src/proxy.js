import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("pabe_session")?.value;

  // 1. Backward-Compatibility Redirect: /dashboard/* -> /admin/*
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const newPath = pathname.replace(/^\/dashboard/, "/admin");
    const redirectUrl = new URL(newPath, request.url);
    request.nextUrl.searchParams.forEach((val, key) => redirectUrl.searchParams.set(key, val));
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Reverse Guard: If already authenticated, redirect away from /login & /register
  if (pathname === "/login" || pathname === "/register") {
    if (session) {
      const role = request.cookies.get("pabe_role")?.value;
      const isStaff = Boolean(role && role !== "DONOR");
      const defaultTarget = isStaff ? "/admin" : "/donatur/dashboard";
      const rawRedirect = request.nextUrl.searchParams.get("redirect");

      let redirectUrl = defaultTarget;
      if (rawRedirect && !["/login", "/register"].includes(rawRedirect)) {
        const isAdminPath = rawRedirect === "/admin" || rawRedirect.startsWith("/admin/");
        const isDonorPath = rawRedirect === "/donatur" || rawRedirect.startsWith("/donatur/");

        // Prevent cross-role redirect ping-pong loops:
        if (isAdminPath && !isStaff) {
          redirectUrl = "/donatur/dashboard";
        } else if (isDonorPath && isStaff) {
          redirectUrl = "/admin";
        } else {
          redirectUrl = rawRedirect;
        }
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 3. Guard Admin Panel Pages (/admin and /admin/*)
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const role = request.cookies.get("pabe_role")?.value;
    const isStaff = Boolean(session && role && role !== "DONOR");

    // Jika belum login atau bukan staf yayasan:
    if (!isStaff) {
      // Jika sudah login tapi akun Donatur biasa: cegah redirect loop dengan mengalihkan langsung ke dasbor donatur
      if (session && role === "DONOR") {
        return NextResponse.redirect(new URL("/donatur/dashboard", request.url));
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Khusus rute manajemen pengurus: hanya SUPER_ADMIN yang diizinkan
    if (pathname === "/admin/pengguna" || pathname.startsWith("/admin/pengguna/")) {
      if (role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  // 4. Guard Client Portal Pages (/donatur and /donatur/*)
  if (pathname === "/donatur" || pathname.startsWith("/donatur/")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = request.cookies.get("pabe_role")?.value;
    if (role && role !== "DONOR" && (pathname === "/donatur" || pathname === "/donatur/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
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

  // 5. Guard Sensitive Internal API Endpoints (/api/admin/*, /api/user/*, /api/dashboard/*)
  if (pathname.startsWith("/api/admin")) {
    const role = request.cookies.get("pabe_role")?.value;
    const isStaff = Boolean(session && role && role !== "DONOR");

    // Kembalikan 404 palsu untuk API admin agar bot scanner tidak mendeteksi endpoint admin
    if (!isStaff) {
      return NextResponse.json(
        {
          success: false,
          message: "Sumber daya tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  if (
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/dashboard")
  ) {
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
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/donatur",
    "/donatur/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/dashboard/:path*",
    "/login",
    "/register",
  ],
};
