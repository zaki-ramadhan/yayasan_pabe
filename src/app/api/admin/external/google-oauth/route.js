import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";

/**
 * Secure Admin Relay Endpoint untuk akses Google Cloud Console (OAuth & Credentials).
 * Mencegah ekspos tautan langsung dan mengamankan otentikasi hanya untuk whitelist akun pengembang.
 */
export async function GET(request) {
  const { user, errorResponse } = await requireAuth(request, [USER_ROLES.SUPER_ADMIN]);
  if (errorResponse) return errorResponse;

  const userEmail = (user?.email || "").toLowerCase().trim();
  if (!isInfrastructureEmail(userEmail)) {
    return NextResponse.json(
      {
        success: false,
        message: "Akses ditolak. Fitur ini khusus untuk akun pengembang / pemilik infrastruktur.",
      },
      { status: 403 }
    );
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "web-ypabe";

  // Arahkan langsung ke halaman daftar Clients OAuth di Google Auth Platform (web-ypabe)
  const destinationUrl = `https://console.cloud.google.com/auth/clients?authuser=0&project=${projectId}&supportedpurview=project`;
  return NextResponse.redirect(destinationUrl, 307);
}
