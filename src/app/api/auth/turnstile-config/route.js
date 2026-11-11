import { NextResponse } from "next/server";
import { CLOUDFLARE_TEST_SITE_KEY } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

/**
 * Route handler publik untuk mengambil sitekey Turnstile aktif secara runtime.
 * Berguna sebagai fallback fail-safe jika env di-inline saat build time.
 */
export async function GET() {
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    CLOUDFLARE_TEST_SITE_KEY;

  return NextResponse.json({ siteKey });
}

