import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail, createSignedSessionToken } from "@/lib/serverAuth";
import { getOAuthSessionDuration, USER_ROLES } from "@/services/authService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateRaw = searchParams.get("state");
  const storedCsrfToken = request.cookies.get("pabe_google_oauth_state")?.value;

  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  let callbackUrl = null;
  if (stateRaw) {
    try {
      const parsed = JSON.parse(
        Buffer.from(stateRaw, stateRaw.includes("-") || stateRaw.includes("_") ? "base64url" : "base64").toString("utf-8")
      );

      if (storedCsrfToken && parsed.csrfToken && storedCsrfToken !== parsed.csrfToken) {
        return NextResponse.redirect(`${origin}/login?error=csrf_token_mismatch`);
      }

      if (parsed.callbackUrl && typeof parsed.callbackUrl === "string") {
        const isSafePath = parsed.callbackUrl.startsWith("/") && !parsed.callbackUrl.startsWith("//");
        if (isSafePath) {
          callbackUrl = parsed.callbackUrl === "/dashboard" || parsed.callbackUrl.startsWith("/dashboard/")
            ? parsed.callbackUrl.replace(/^\/dashboard/, "/admin")
            : parsed.callbackUrl;
        }
      }
    } catch {}
  }

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

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${origin}/login?error=userinfo_fetch_failed`);
    }

    const profile = await userInfoResponse.json();

    if (!profile.email || profile.verified_email === false) {
      return NextResponse.redirect(`${origin}/login?error=no_email_provided`);
    }

    const sanitizedUsername = profile.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 30);

    const isSuperAdmin = isSuperAdminEmail(profile.email);
    const resolvedRole = isSuperAdmin ? "SUPER_ADMIN" : "DONOR";
    const resolvedTitle = isSuperAdmin ? "Super Admin" : "Donatur";

    let dbUser = null;
    let isSuspendedAccount = false;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
        select: { avatar: true, isActive: true, provider: true },
      });

      if (existingUser && existingUser.isActive === false && !isSuperAdmin) {
        isSuspendedAccount = true;
      } else {
        let uniqueUsername = sanitizedUsername;
        if (!existingUser) {
          const usernameTaken = await prisma.user.findUnique({
            where: { username: sanitizedUsername },
            select: { id: true },
          });
          if (usernameTaken) {
            uniqueUsername = `${sanitizedUsername}_${String(profile.id || Date.now()).slice(-4)}`;
          }
        }

        const preserveExistingProvider =
          existingUser?.provider && existingUser.provider !== "GOOGLE";

        dbUser = await prisma.user.upsert({
          where: { email: profile.email.toLowerCase() },
          update: {
            name: profile.name || undefined,
            providerAvatar: profile.picture || undefined,
            ...(existingUser?.avatar ? {} : { avatar: profile.picture || undefined }),
            ...(preserveExistingProvider
              ? {}
              : { provider: "GOOGLE", providerId: profile.id }),
            ...(isSuperAdmin ? { role: "SUPER_ADMIN", title: "Super Admin", isActive: true } : {}),
          },
          create: {
            name: profile.name || profile.email.split("@")[0],
            email: profile.email.toLowerCase(),
            username: uniqueUsername,
            avatar: profile.picture || null,
            providerAvatar: profile.picture || null,
            role: resolvedRole,
            title: resolvedTitle,
            provider: "GOOGLE",
            providerId: profile.id,
          },
        });
      }
    } catch (dbError) {
      console.warn("Database sync warning (continuing with verified Google OAuth session):", dbError?.message);
    }

    if (isSuspendedAccount) {
      const suspendedRes = NextResponse.redirect(`${origin}/login?error=account_suspended`);
      suspendedRes.cookies.delete("pabe_google_oauth_state");
      return suspendedRes;
    }

    const userId = dbUser?.id || `USR-GGL-${profile.id || Date.now()}`;
    const userName = dbUser?.name || profile.name || profile.email.split("@")[0];
    const userEmail = dbUser?.email || profile.email.toLowerCase();
    const userUsername = dbUser?.username || sanitizedUsername;
    const userRole = isSuperAdmin ? "SUPER_ADMIN" : (dbUser?.role || "DONOR");
    const rawUserTitle = isSuperAdmin ? "Super Admin" : (dbUser?.title || "Donatur");
    const userTitle = rawUserTitle.includes("Ketua Yayasan") ? "Super Admin" : rawUserTitle;
    const userAvatar = dbUser?.avatar || profile.picture || null;
    const customAvatar = dbUser?.customAvatar || null;
    const providerAvatar = profile.picture || dbUser?.providerAvatar || null;

    const isStaff = userRole && userRole !== USER_ROLES.DONOR;
    const durationSec = getOAuthSessionDuration(userRole);
    const expiresAt = Date.now() + durationSec * 1000;
    const signedSessionToken = createSignedSessionToken(
      { id: userId, email: userEmail, role: userRole },
      durationSec
    );

    const sessionPayload = {
      id: userId,
      sessionToken: signedSessionToken,
      name: userName,
      email: userEmail,
      username: userUsername,
      role: userRole,
      title: userTitle,
      avatar: userAvatar,
      customAvatar,
      providerAvatar,
      initials: (userName || userEmail).slice(0, 2).toUpperCase(),
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      provider: "google",
      providerId: profile.id,
      expiresAt,
      sessionIssuedAt: Date.now(),
    };

    const sessionJson = JSON.stringify(sessionPayload).replace(/</g, "\\u003c");
    const isStaffRole = userRole && userRole !== USER_ROLES.DONOR;
    let targetUrl;

    if (isStaffRole) {
      if (callbackUrl && (callbackUrl === "/admin" || callbackUrl.startsWith("/admin/"))) {
        targetUrl = callbackUrl;
      } else {
        targetUrl = "/admin";
      }
    } else {
      if (
        callbackUrl &&
        !["/login", "/register", "/", "/admin"].includes(callbackUrl) &&
        !callbackUrl.startsWith("/admin/")
      ) {
        targetUrl = callbackUrl;
      } else {
        targetUrl = "/donatur/dashboard";
      }
    }

    const responseHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <title>Menghubungkan Akun Google...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #fafaf9;
              color: #0f172a;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 1.5rem;
              max-width: 400px;
              width: 100%;
            }
            .spinner-wrapper {
              position: relative;
              width: 100px;
              height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.5rem;
            }
            .spinner-svg {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              animation: spin 1.2s linear infinite;
            }
            .icon-badge {
              position: relative;
              z-index: 2;
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              border: 1px solid rgba(226, 232, 240, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .title {
              font-size: 1.125rem;
              font-weight: 500;
              color: #0f172a;
              letter-spacing: -0.015em;
              margin-bottom: 0.375rem;
              line-height: 1.35;
            }
            .subtitle {
              font-size: 0.8125rem;
              font-weight: 400;
              color: #64748b;
              line-height: 1.5;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner-wrapper">
              <svg class="spinner-svg" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#E2E8F0" stroke-width="3.5" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="75 200" />
              </svg>
              <div class="icon-badge">
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
            </div>
            <h1 class="title">Menghubungkan akun Google...</h1>
            <p class="subtitle">Mohon tunggu sejenak, kami sedang menyiapkan sesi Anda.</p>
          </div>
          <script>
            try {
              const session = ${sessionJson};
              const jsonStr = JSON.stringify(session);
              localStorage.setItem('pabe_auth_user', jsonStr);
              localStorage.setItem('pabe_auth_session', jsonStr);
              sessionStorage.setItem('pabe_just_logged_in', session.name || 'Donatur');
              sessionStorage.setItem('pabe_last_activity', String(Date.now()));

              const durSec = ${durationSec};
              document.cookie = 'pabe_role=' + encodeURIComponent(session.role || 'DONOR') + '; path=/; max-age=' + durSec + '; SameSite=Lax';

              window.dispatchEvent(new Event('pabe_auth_change'));
              window.dispatchEvent(new Event('storage'));

              setTimeout(function() {
                window.location.replace('${targetUrl}');
              }, 150);
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

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: durationSec,
      path: "/",
    };
    response.cookies.set("pabe_session", signedSessionToken, cookieOpts);
    response.cookies.set("pabe_role", userRole, { ...cookieOpts, httpOnly: false });
    response.cookies.delete("pabe_google_oauth_state");

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(`${origin}/login?error=internal_oauth_error`);
  }
}
