import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getAdminUsers, createAdminUser } from "@/services/adminUserService";

export async function GET(request) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "ALL";
  const status = searchParams.get("status") || "ALL";
  const page = parseInt(searchParams.get("page"), 10) || 1;
  const limit = parseInt(searchParams.get("limit"), 10) || 10;

  try {
    const data = await getAdminUsers({ search, role, status, page, limit });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data pengurus." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const result = await createAdminUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      title: body.title,
      password: body.password,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun pengurus berhasil didaftarkan.",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat akun pengurus." },
      { status: 400 }
    );
  }
}
