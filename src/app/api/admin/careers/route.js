import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminVacancies,
  createAdminVacancy,
  deleteAdminVacanciesBatch,
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

export async function DELETE(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar ID lowongan untuk dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteAdminVacanciesBatch(ids);
    return NextResponse.json({
      success: true,
      message: `${result.count} lowongan pekerjaan berhasil dihapus.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus lowongan secara massal." },
      { status: 500 }
    );
  }
}
