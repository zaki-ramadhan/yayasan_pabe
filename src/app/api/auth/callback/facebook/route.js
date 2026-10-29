import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail } from "@/lib/serverAuth";
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

  // Retrieve stored cookies
  const cookies = request.cookies;
  const storedState = cookies.get("pabe_fb_oauth_state")?.value;
  const authMode = cookies.get("pabe_auth_mode")?.value || "login";
  const redirectTarget = cookies.get("pabe_auth_redirect")?.value || "/";

  const fallbackBaseUrl = authMode === "register" ? "/register" : "/login";

  // Handle user cancellation or Facebook authorization error
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

  // Validate CSRF state
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

    // 1. Exchange code for Facebook Graph API access token
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

    // 2. Fetch User Profile from Facebook Graph API
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

    // 3. Format standardized User object and resolve Avatar
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

    // Resilient fallback: Query dedicated /me/picture endpoint if profileData didn't return a direct picture URL
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
    try {
      dbUser = await prisma.user.upsert({
        where: { email: userEmail },
        update: {
          name: cleanName || undefined,
          ...(fbAvatar ? { avatar: fbAvatar } : {}),
          provider: "FACEBOOK",
          providerId: profileData.id,
          ...(isSuperAdmin ? { role: "SUPER_ADMIN", title: "Super Admin" } : {}),
        },
        create: {
          name: cleanName,
          email: userEmail,
          username: `${sanitizedUsername}_${String(profileData.id).slice(-4)}`,
          avatar: fbAvatar || null,
          role: resolvedRole,
          title: resolvedTitle,
          provider: "FACEBOOK",
          providerId: profileData.id,
        },
      });
    } catch (dbError) {
      console.warn("Database sync warning (continuing with verified Facebook OAuth session):", dbError?.message);
    }

    const userId = dbUser?.id || `USR-FB-${profileData.id}`;
    const userName = dbUser?.name || cleanName;
    const finalEmail = dbUser?.email || userEmail;
    const userRole = isSuperAdmin ? "SUPER_ADMIN" : (dbUser?.role || "DONOR");
    const userTitle = isSuperAdmin ? "Super Admin" : (dbUser?.title || "Donatur");
    const userAvatar = fbAvatar || dbUser?.avatar || null;

    const isStaff = userRole && userRole !== USER_ROLES.DONOR;
    const durationSec = getOAuthSessionDuration(userRole);
    const expiresAt = Date.now() + durationSec * 1000;

    const sessionPayload = {
      id: userId,
      name: userName,
      email: finalEmail,
      username: dbUser?.username || `${sanitizedUsername}_${String(profileData.id).slice(-4)}`,
      role: userRole,
      title: userTitle,
      avatar: userAvatar,
      initials: initials || "FB",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
      provider: "facebook",
      providerId: profileData.id,
      expiresAt,
      sessionIssuedAt: Date.now(),
    };

    const sessionJson = JSON.stringify(sessionPayload).replace(/</g, "\\u003c");
    const defaultTarget = userRole === "DONOR" ? "/donatur/dashboard" : "/admin";
    let targetUrl =
      redirectTarget && !["/login", "/register", "/"].includes(redirectTarget)
        ? redirectTarget
        : defaultTarget;

    if (targetUrl.startsWith("/dashboard")) {
      targetUrl = targetUrl.replace(/^\/dashboard/, "/admin");
    }

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
              border-top-color: #1877f2;
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
            <p style="font-size: 14px; font-weight: 500;">Memverifikasi Akun Facebook...</p>
          </div>
          <script>
            try {
              const session = ${sessionJson};
              const jsonStr = JSON.stringify(session);
              localStorage.setItem('pabe_auth_user', jsonStr);
              localStorage.setItem('pabe_auth_session', jsonStr);
              sessionStorage.setItem('pabe_just_logged_in', session.name || 'Donatur');
              sessionStorage.setItem('pabe_last_activity', String(Date.now()));
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

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: durationSec,
      path: "/",
    };

    response.cookies.set("pabe_session", userId, cookieOpts);
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

