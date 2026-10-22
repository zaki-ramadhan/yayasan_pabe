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
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  // Construct origin dynamically
  const origin =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  const redirectUri = `${origin}/api/auth/callback/google`;

  // Encode state with return path
  const state = Buffer.from(JSON.stringify({ callbackUrl, timestamp: Date.now() })).toString("base64");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(googleAuthUrl.toString(), 307);
}
