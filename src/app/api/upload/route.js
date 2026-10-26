import { NextResponse } from "next/server";
import { uploadToR2, isR2Configured } from "@/lib/r2Storage";
import { getStorageContext } from "@/lib/storageConstants";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Layanan penyimpanan Cloudflare R2 belum dikonfigurasi di server.",
        },
        { status: 503 }
      );
    }

    const rateLimitBlocked = checkRateLimit(request, {
      action: "r2_upload",
      limit: 20,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const formData = await request.formData();
    const file = formData.get("file");
    const contextKey = formData.get("context");
    const identifier = formData.get("identifier") || "";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "Berkas tidak ditemukan dalam formulir unggahan." },
        { status: 400 }
      );
    }

    if (!contextKey || typeof contextKey !== "string") {
      return NextResponse.json(
        { success: false, message: "Konteks unggahan (context) wajib disertakan." },
        { status: 400 }
      );
    }

    let contextConfig;
    try {
      contextConfig = getStorageContext(contextKey);
    } catch (ctxErr) {
      return NextResponse.json(
        { success: false, message: ctxErr.message },
        { status: 400 }
      );
    }

    // Role-Based Authorization jika konteks mensyaratkan otentikasi/peran tertentu
    if (contextConfig.allowedRoles !== null) {
      const { errorResponse } = await requireAuth(request, contextConfig.allowedRoles);
      if (errorResponse) return errorResponse;
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadToR2({
      data: arrayBuffer,
      originalName: file.name || "upload",
      declaredType: file.type,
      context: contextKey,
      identifier: typeof identifier === "string" ? identifier.trim() : "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Berkas berhasil diunggah dan dioptimasi.",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengunggah berkas ke Cloudflare R2.",
      },
      { status: 400 }
    );
  }
}
