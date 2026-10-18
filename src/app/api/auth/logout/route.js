import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesi berhasil diakhiri.",
  });

  response.cookies.delete("pabe_session");
  response.cookies.delete("ygsm_session");
  return response;
}
