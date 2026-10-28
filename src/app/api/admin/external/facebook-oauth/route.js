import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";

/**
 * Secure Admin Relay Endpoint untuk akses Meta for Developers (Facebook Login & OAuth Settings).
 * Mengarahkan langsung ke halaman konfigurasi OAuth aplikasi jika App ID ada, atau ke dashboard Meta apps.
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

  const appId =
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
    process.env.FACEBOOK_APP_ID ||
    "1105847055308833";

  // Arahkan ke halaman pengaturan dasar / credentials aplikasi di Meta for Developers
  const destinationUrl = `https://developers.facebook.com/apps/${appId}/settings/basic/`;

  return NextResponse.redirect(destinationUrl, 307);
}
