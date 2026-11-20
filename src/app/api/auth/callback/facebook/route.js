import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail, createSignedSessionToken } from "@/lib/serverAuth";
import { getOAuthSessionDuration, USER_ROLES } from "@/services/authService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  const appId =
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  const cookies = request.cookies;
  const storedState = cookies.get("pabe_fb_oauth_state")?.value;
  const authMode = cookies.get("pabe_auth_mode")?.value || "login";
  const redirectTarget = cookies.get("pabe_auth_redirect")?.value || "/";

  const fallbackBaseUrl = authMode === "register" ? "/register" : "/login";

  if (error || !code) {
    const errorRedirect = new URL(fallbackBaseUrl, origin);
    errorRedirect.searchParams.set(
      "error",
      error === "access_denied" ? "fb_cancelled" : "fb_error"
    );
    if (errorDescription) {
      errorRedirect.searchParams.set("reason", errorDescription);
    }
    const res = NextResponse.redirect(errorRedirect);
    res.cookies.delete("pabe_fb_oauth_state");
    res.cookies.delete("pabe_auth_mode");
    res.cookies.delete("pabe_auth_redirect");
    return res;
  }

  if (!storedState || storedState !== state) {
    const invalidStateRedirect = new URL(fallbackBaseUrl, origin);
    invalidStateRedirect.searchParams.set("error", "fb_state_mismatch");
    const res = NextResponse.redirect(invalidStateRedirect);
    res.cookies.delete("pabe_fb_oauth_state");
    res.cookies.delete("pabe_auth_mode");
    res.cookies.delete("pabe_auth_redirect");
    return res;
  }

  if (!appId || !appSecret) {
    const credsMissingRedirect = new URL(fallbackBaseUrl, origin);
    credsMissingRedirect.searchParams.set("error", "fb_token_failed");
    const res = NextResponse.redirect(credsMissingRedirect);
    res.cookies.delete("pabe_fb_oauth_state");
    res.cookies.delete("pabe_auth_mode");
    res.cookies.delete("pabe_auth_redirect");
    return res;
  }

  try {
    const callbackUrl = `${origin}/api/auth/callback/facebook`;

    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", callbackUrl);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Facebook Token Exchange Failed:", tokenData);
      const tokenErrorRedirect = new URL(fallbackBaseUrl, origin);
      tokenErrorRedirect.searchParams.set("error", "fb_token_failed");
      const res = NextResponse.redirect(tokenErrorRedirect);
      res.cookies.delete("pabe_fb_oauth_state");
      res.cookies.delete("pabe_auth_mode");
      res.cookies.delete("pabe_auth_redirect");
      return res;
    }

    const accessToken = tokenData.access_token;

    const profileUrl = new URL("https://graph.facebook.com/v19.0/me");
    profileUrl.searchParams.set(
      "fields",
      "id,name,first_name,last_name,email,picture.type(large)"
    );
    profileUrl.searchParams.set("access_token", accessToken);

    const profileResponse = await fetch(profileUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok || !profileData.id) {
      console.error("Facebook Profile Fetch Failed:", profileData);
      const profileErrorRedirect = new URL(fallbackBaseUrl, origin);
      profileErrorRedirect.searchParams.set("error", "fb_profile_failed");
      const res = NextResponse.redirect(profileErrorRedirect);
      res.cookies.delete("pabe_fb_oauth_state");
      res.cookies.delete("pabe_auth_mode");
      res.cookies.delete("pabe_auth_redirect");
      return res;
    }

    const cleanName = profileData.name || "Donatur Facebook";
    const initials = cleanName
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const sanitizedUsername = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 15);

    let fbAvatar = profileData.picture?.data?.url || null;

    if (!fbAvatar && profileData.id) {
      try {
        const picUrl = new URL(`https://graph.facebook.com/v19.0/${profileData.id}/picture`);
        picUrl.searchParams.set("type", "large");
        picUrl.searchParams.set("redirect", "false");
        picUrl.searchParams.set("access_token", accessToken);

        const picResponse = await fetch(picUrl.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (picResponse.ok) {
          const picData = await picResponse.json();
          if (picData?.data?.url) {
            fbAvatar = picData.data.url;
          }
        }
      } catch (picErr) {
        console.warn("Fallback Facebook picture fetch error:", picErr?.message);
      }
    }

    const userEmail = profileData.email
      ? profileData.email.toLowerCase()
      : `fb.${profileData.id}@facebook.user`;

    const isSuperAdmin = isSuperAdminEmail(userEmail);
    const resolvedRole = isSuperAdmin ? "SUPER_ADMIN" : "DONOR";
    const resolvedTitle = isSuperAdmin ? "Super Admin" : "Donatur";

    let dbUser = null;
    let isSuspendedAccount = false;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          avatar: true,
          customAvatar: true,
          providerAvatar: true,
          isActive: true,
          provider: true,
        },
      });

      if (existingUser && existingUser.isActive === false && !isSuperAdmin) {
        isSuspendedAccount = true;
      } else {
        const preserveExistingProvider =
          existingUser?.provider && existingUser.provider !== "FACEBOOK";

        const resolvedActiveAvatar = existingUser?.customAvatar
          ? existingUser.customAvatar
          : existingUser?.avatar
          ? existingUser.avatar
          : (fbAvatar || null);

        dbUser = await prisma.user.upsert({
          where: { email: userEmail },
          update: {
            name: cleanName || undefined,
            avatar: resolvedActiveAvatar || undefined,
            providerAvatar: fbAvatar || undefined,
            ...(preserveExistingProvider
              ? {}
              : { provider: "FACEBOOK", providerId: profileData.id }),
            ...(isSuperAdmin ? { role: "SUPER_ADMIN", title: "Super Admin", isActive: true } : {}),
          },
          create: {
            name: cleanName,
            email: userEmail,
            username: `${sanitizedUsername}_${String(profileData.id).slice(-4)}`,
            avatar: fbAvatar || null,
            providerAvatar: fbAvatar || null,
            role: resolvedRole,
            title: resolvedTitle,
            provider: "FACEBOOK",
            providerId: profileData.id,
          },
        });
      }
    } catch (dbError) {
      console.warn("Database sync warning (continuing with verified Facebook OAuth session):", dbError?.message);
    }

    if (isSuspendedAccount) {
      const suspendedRedirect = new URL(fallbackBaseUrl, origin);
      suspendedRedirect.searchParams.set("error", "account_suspended");
      const res = NextResponse.redirect(suspendedRedirect);
      res.cookies.delete("pabe_fb_oauth_state");
      res.cookies.delete("pabe_auth_mode");
      res.cookies.delete("pabe_auth_redirect");
      return res;
    }

    const userId = dbUser?.id || `USR-FB-${profileData.id}`;
    const userName = dbUser?.name || cleanName;
    const finalEmail = dbUser?.email || userEmail;
    const userRole = isSuperAdmin ? "SUPER_ADMIN" : (dbUser?.role || "DONOR");
    const userTitle = isSuperAdmin ? "Super Admin" : (dbUser?.title || "Donatur");
    const customAvatar = dbUser?.customAvatar || null;
    const userAvatar = customAvatar || dbUser?.avatar || fbAvatar || null;
    const providerAvatar = fbAvatar || dbUser?.providerAvatar || null;

    const isStaff = userRole && userRole !== USER_ROLES.DONOR;
    const durationSec = getOAuthSessionDuration(userRole);
    const expiresAt = Date.now() + durationSec * 1000;
    const signedSessionToken = createSignedSessionToken(
      { id: userId, email: finalEmail, role: userRole },
      durationSec
    );

    const sessionPayload = {
      id: userId,
      sessionToken: signedSessionToken,
      name: userName,
      email: finalEmail,
      username: dbUser?.username || `${sanitizedUsername}_${String(profileData.id).slice(-4)}`,
      role: userRole,
      title: userTitle,
      avatar: userAvatar,
      customAvatar,
      providerAvatar,
      initials: initials || "FB",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
      provider: "facebook",
      providerId: profileData.id,
      expiresAt,
      sessionIssuedAt: Date.now(),
    };

    const sessionJson = JSON.stringify(sessionPayload).replace(/</g, "\\u003c");
    const isStaffRole = userRole && userRole !== USER_ROLES.DONOR;
    let targetUrl;

    if (isStaffRole) {
      const normalizedTarget = redirectTarget?.startsWith("/dashboard")
        ? redirectTarget.replace(/^\/dashboard/, "/admin")
        : redirectTarget;
      if (normalizedTarget && (normalizedTarget === "/admin" || normalizedTarget.startsWith("/admin/"))) {
        targetUrl = normalizedTarget;
      } else {
        targetUrl = "/admin";
      }
    } else {
      if (
        redirectTarget &&
        !["/login", "/register", "/", "/admin"].includes(redirectTarget) &&
        !redirectTarget.startsWith("/admin/") &&
        !redirectTarget.startsWith("/dashboard")
      ) {
        targetUrl = redirectTarget;
      } else {
        targetUrl = "/donatur/dashboard";
      }
    }

    const responseHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <title>Menghubungkan Akun Facebook...</title>
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
                <circle cx="50" cy="50" r="44" fill="none" stroke="#1877F2" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="75 200" />
              </svg>
              <div class="icon-badge">
                <svg width="28" height="28" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
            </div>
            <h1 class="title">Menghubungkan akun Facebook...</h1>
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

    response.cookies.delete("pabe_fb_oauth_state");
    response.cookies.delete("pabe_auth_mode");
    response.cookies.delete("pabe_auth_redirect");

    return response;
  } catch (err) {
    console.error("Facebook OAuth Callback Exception:", err);
    const errRedirect = new URL(fallbackBaseUrl, origin);
    errRedirect.searchParams.set("error", "fb_internal_error");
    const res = NextResponse.redirect(errRedirect);
    res.cookies.delete("pabe_fb_oauth_state");
    res.cookies.delete("pabe_auth_mode");
    res.cookies.delete("pabe_auth_redirect");
    return res;
  }
}

