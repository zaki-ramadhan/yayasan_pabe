import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesi berhasil diakhiri.",
  });

  const clearOpts = {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set("pabe_session", "", clearOpts);
  response.cookies.set("pabe_role", "", clearOpts);
  response.cookies.set("ygsm_session", "", clearOpts);
  response.cookies.set("ygsm_role", "", clearOpts);
  return response;
}
