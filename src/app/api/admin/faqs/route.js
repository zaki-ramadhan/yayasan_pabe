import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminFaqs,
  createAdminFaq,
} from "@/services/adminFaqService";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.VOLUNTEER,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const faqs = await getAdminFaqs({ search });
    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data FAQ." },
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
    if (!body.question || !body.answer) {
      return NextResponse.json(
        { success: false, message: "Pertanyaan dan jawaban wajib diisi." },
        { status: 400 }
      );
    }

    const faq = await createAdminFaq(body);
    return NextResponse.json({
      success: true,
      message: "FAQ baru berhasil ditambahkan.",
      data: faq,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat FAQ baru." },
      { status: 500 }
    );
  }
}
