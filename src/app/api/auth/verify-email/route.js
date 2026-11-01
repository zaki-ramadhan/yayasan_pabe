import { NextResponse } from "next/server";
import { verifyActivationToken } from "@/services/accountActivationService";

export const dynamic = "force-dynamic";

/**
 * Endpoint GET: Memvalidasi tautan aktivasi akun dari email donatur
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  if (!token) {
    return NextResponse.redirect(
      `${baseUrl}/login?activationError=${encodeURIComponent("Token aktivasi tidak ditemukan.")}`
    );
  }

  const result = await verifyActivationToken(token);

  if (!result.success) {
    return NextResponse.redirect(
      `${baseUrl}/login?activationError=${encodeURIComponent(result.message)}`
    );
  }

  // Sukses: Redirect ke halaman login dengan parameter verified=true
  return NextResponse.redirect(
    `${baseUrl}/login?verified=true`
  );
}
