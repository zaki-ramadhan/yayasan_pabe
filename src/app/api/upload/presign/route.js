import { NextResponse } from "next/server";
import { createPresignedUploadUrl, isR2Configured } from "@/lib/r2Storage";
import { getStorageContext } from "@/lib/storageConstants";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * Issue a presigned Cloudflare R2 PUT URL for large files/videos to bypass serverless body limits.
 */
export async function POST(request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { success: false, message: "Layanan penyimpanan berkas sedang dalam pemeliharaan." },
        { status: 503 }
      );
    }

    const rateLimitBlocked = checkRateLimit(request, {
      action: "r2_presign",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const { context, identifier = "", fileName = "berkas", contentType, size, posterContentType } = body || {};

    if (!context || typeof context !== "string") {
      return NextResponse.json(
        { success: false, message: "Konteks unggahan (context) wajib disertakan." },
        { status: 400 }
      );
    }

    let contextConfig;
    try {
      contextConfig = getStorageContext(context);
    } catch (ctxErr) {
      return NextResponse.json({ success: false, message: ctxErr.message }, { status: 400 });
    }

    if (contextConfig.allowedRoles !== null) {
      const { errorResponse } = await requireAuth(request, contextConfig.allowedRoles);
      if (errorResponse) return errorResponse;
    }

    const data = await createPresignedUploadUrl({
      context,
      identifier: typeof identifier === "string" ? identifier.trim() : "",
      originalName: typeof fileName === "string" ? fileName : "berkas",
      contentType,
      size,
      posterContentType,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menyiapkan tautan unggahan berkas." },
      { status: 400 }
    );
  }
}

