import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminVacancies,
  createAdminVacancy,
} from "@/services/adminCareerService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.VOLUNTEER,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "ALL";

    const vacancies = await getAdminVacancies({ search, department });
    return NextResponse.json({
      success: true,
      data: vacancies,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data lowongan." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    if (!body.title || !body.department || !body.overview) {
      return NextResponse.json(
        { success: false, message: "Judul, divisi, dan deskripsi posisi wajib diisi." },
        { status: 400 }
      );
    }

    const vacancy = await createAdminVacancy(body);
    return NextResponse.json({
      success: true,
      message: "Lowongan pekerjaan berhasil ditambahkan.",
      data: vacancy,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat lowongan baru." },
      { status: 500 }
    );
  }
}
