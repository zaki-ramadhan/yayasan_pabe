import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        message: "GOOGLE_CLIENT_ID belum dikonfigurasi di file .env",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/admin";
  const safeCallbackUrl =
    rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/admin";

  // Construct origin dynamically
  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  const redirectUri = `${origin}/api/auth/callback/google`;

  // Generate random CSRF token
  const csrfToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

  // Encode state with return path and CSRF token
  const state = Buffer.from(
    JSON.stringify({ csrfToken, callbackUrl: safeCallbackUrl, timestamp: Date.now() })
  ).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString(), 307);
  response.cookies.set("pabe_google_oauth_state", csrfToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 menit
  });

  return response;
}
