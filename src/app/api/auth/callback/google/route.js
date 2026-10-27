import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateRaw = searchParams.get("state");

  let callbackUrl = null;
  if (stateRaw) {
    try {
      const parsed = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
      if (parsed.callbackUrl) {
        callbackUrl = parsed.callbackUrl === "/dashboard" || parsed.callbackUrl.startsWith("/dashboard/")
          ? parsed.callbackUrl.replace(/^\/dashboard/, "/admin")
          : parsed.callbackUrl;
      }
    } catch {}
  }

  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=oauth_credentials_missing`);
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;

    // 1. Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange error:", errorData);
      return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // 2. Fetch User Profile Info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${origin}/login?error=userinfo_fetch_failed`);
    }

    const profile = await userInfoResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(`${origin}/login?error=no_email_provided`);
    }

    // 3. Upsert User in PostgreSQL Database via Prisma (with resilient fallback)
    const sanitizedUsername = profile.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 30);

    const isSuperAdmin = isSuperAdminEmail(profile.email);
    const resolvedRole = isSuperAdmin ? "SUPER_ADMIN" : "DONOR";
    const resolvedTitle = isSuperAdmin ? "Super Admin" : "Donatur";

    let dbUser = null;
    try {
      dbUser = await prisma.user.upsert({
        where: { email: profile.email.toLowerCase() },
        update: {
          name: profile.name || undefined,
          avatar: profile.picture || undefined,
          provider: "GOOGLE",
          providerId: profile.id,
          ...(isSuperAdmin ? { role: "SUPER_ADMIN", title: "Super Admin" } : {}),
        },
        create: {
          name: profile.name || profile.email.split("@")[0],
          email: profile.email.toLowerCase(),
          username: sanitizedUsername,
          avatar: profile.picture || null,
          role: resolvedRole,
          title: resolvedTitle,
          provider: "GOOGLE",
          providerId: profile.id,
        },
      });
    } catch (dbError) {
      console.warn("Database sync warning (continuing with verified Google OAuth session):", dbError?.message);
    }

    const userId = dbUser?.id || `USR-GGL-${profile.id || Date.now()}`;
    const userName = dbUser?.name || profile.name || profile.email.split("@")[0];
    const userEmail = dbUser?.email || profile.email.toLowerCase();
    const userUsername = dbUser?.username || sanitizedUsername;
    const userRole = isSuperAdmin ? "SUPER_ADMIN" : (dbUser?.role || "DONOR");
    const rawUserTitle = isSuperAdmin ? "Super Admin" : (dbUser?.title || "Donatur");
    const userTitle = rawUserTitle.includes("Ketua Yayasan") ? "Super Admin" : rawUserTitle;
    const userAvatar = profile.picture || dbUser?.avatar || null;

    const isStaff = userRole && userRole !== "DONOR";
    const durationSec = isStaff ? 12 * 60 * 60 : 7 * 24 * 60 * 60;
    const expiresAt = Date.now() + durationSec * 1000;

    const sessionPayload = {
      id: userId,
      name: userName,
      email: userEmail,
      username: userUsername,
      role: userRole,
      title: userTitle,
      avatar: userAvatar,
      initials: (userName || userEmail).slice(0, 2).toUpperCase(),
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      provider: "google",
      providerId: profile.id,
      expiresAt,
      sessionIssuedAt: Date.now(),
    };

    // 4. Return HTML bridge to sync localStorage session and redirect smoothly
    const sessionJson = JSON.stringify(sessionPayload).replace(/</g, "\\u003c");
    const defaultTarget = userRole === "DONOR" ? "/" : "/admin";
    const targetUrl =
      callbackUrl && !["/login", "/register", "/"].includes(callbackUrl)
        ? callbackUrl
        : defaultTarget;

    const responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autentikasi Berhasil...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #020617;
              color: #f8fafc;
            }
            .loader {
              text-align: center;
              padding: 2rem;
            }
            .spinner {
              width: 36px;
              height: 36px;
              border: 3px solid rgba(255,255,255,0.15);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p style="font-size: 14px; font-weight: 500;">Memverifikasi Akun Google...</p>
          </div>
          <script>
            try {
              const session = ${sessionJson};
              const jsonStr = JSON.stringify(session);
              localStorage.setItem('pabe_auth_user', jsonStr);
              localStorage.setItem('pabe_auth_session', jsonStr);
              sessionStorage.setItem('pabe_just_logged_in', session.name || 'Donatur');
              window.dispatchEvent(new Event('pabe_auth_change'));
              window.dispatchEvent(new Event('storage'));
              window.location.replace('${targetUrl}');
            } catch (err) {
              window.location.replace('${targetUrl}');
            }
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(responseHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });

    // Set secure session cookie with role-based maxAge
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: durationSec,
      path: "/",
    };
    response.cookies.set("pabe_session", userId, cookieOpts);
    response.cookies.set("pabe_role", userRole, { ...cookieOpts, httpOnly: false });

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${origin}/login?error=internal_oauth_error`);
  }
}
