import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "login";
  const callbackUrlParam =
    searchParams.get("callbackUrl") || searchParams.get("redirect") || "/";

  const appId =
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID;

  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  if (!appId) {
    const errorUrl = new URL(
      mode === "register" ? "/register" : "/login",
      origin
    );
    errorUrl.searchParams.set("error", "fb_missing_app_id");
    return NextResponse.redirect(errorUrl);
  }

  // Generate secure CSRF state token
  const state = crypto.randomBytes(24).toString("hex");
  const callbackUrl = `${origin}/api/auth/callback/facebook`;

  const facebookOAuthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  facebookOAuthUrl.searchParams.set("client_id", appId);
  facebookOAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  facebookOAuthUrl.searchParams.set("state", state);
  facebookOAuthUrl.searchParams.set("response_type", "code");
  facebookOAuthUrl.searchParams.set("scope", "public_profile,email");

  const response = NextResponse.redirect(facebookOAuthUrl.toString(), 307);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  };

  // Store temporary state and mode in cookies for CSRF verification
  response.cookies.set("pabe_fb_oauth_state", state, cookieOpts);
  response.cookies.set("pabe_auth_mode", mode, cookieOpts);
  response.cookies.set("pabe_auth_redirect", callbackUrlParam, cookieOpts);

  return response;
}

