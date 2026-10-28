import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";

/**
 * Secure Admin Relay Endpoint untuk akses Cloudflare R2 Dashboard.
 * Mencegah ekspos Cloudflare Account ID di bundle client-side JS publik.
 * Memvalidasi otentikasi session cookie dan whitelist email pengembang di server.
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

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME || "ypabe-storage";

  if (!accountId) {
    return NextResponse.json(
      {
        success: false,
        message: "R2_ACCOUNT_ID belum dikonfigurasi di environment server.",
      },
      { status: 500 }
    );
  }

  const destinationUrl = `https://dash.cloudflare.com/${accountId}/r2/default/buckets/${bucketName}`;
  return NextResponse.redirect(destinationUrl, 307);
}
