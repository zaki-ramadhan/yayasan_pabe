import { NextResponse } from "next/server";
import { uploadToR2, deleteFromR2, isR2Configured } from "@/lib/r2Storage";
import { getStorageContext } from "@/lib/storageConstants";
import { VIDEO_POSTER_SUFFIX } from "@/lib/galleryGroupHelper";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Layanan penyimpanan berkas sedang dalam pemeliharaan.",
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
    const posterFile = formData.get("poster");
    const rawImageUrl = formData.get("imageUrl");
    const contextKey = formData.get("context");
    const identifier = formData.get("identifier") || "";

    const hasFile = file && typeof file !== "string";
    const hasUrl = typeof rawImageUrl === "string" && rawImageUrl.trim().length > 0;

    if (!hasFile && !hasUrl) {
      return NextResponse.json(
        { success: false, message: "Berkas atau tautan gambar wajib disertakan." },
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

    if (contextConfig.allowedRoles !== null) {
      const { errorResponse } = await requireAuth(request, contextConfig.allowedRoles);
      if (errorResponse) return errorResponse;
    }

    let arrayBuffer;
    let originalName = "upload";
    let declaredType = "image/jpeg";

    if (hasFile) {
      arrayBuffer = await file.arrayBuffer();
      originalName = file.name || "upload";
      declaredType = file.type;
    } else {
      if (contextConfig.allowedRoles === null) {
        return NextResponse.json(
          {
            success: false,
            message: "Pengunggahan publik hanya mengizinkan berkas dokumen/gambar langsung, bukan tautan URL.",
          },
          { status: 400 }
        );
      }

      const targetUrl = rawImageUrl.trim();
      try {
        let fetchRes;
        if (targetUrl.startsWith("data:")) {
          fetchRes = await fetch(targetUrl);
          declaredType = (fetchRes.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
          arrayBuffer = await fetchRes.arrayBuffer();
          originalName = "pasted-image";
        } else {
          let parsedUrl;
          try {
            parsedUrl = new URL(targetUrl);
          } catch {
            return NextResponse.json(
              { success: false, message: "Format tautan URL tidak valid." },
              { status: 400 }
            );
          }

          if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return NextResponse.json(
              { success: false, message: "Hanya protokol HTTP atau HTTPS yang diizinkan." },
              { status: 400 }
            );
          }

          const isBlockedSsrfHost = (rawHost) => {
            if (!rawHost) return true;
            const h = rawHost.toLowerCase().replace(/^\[|\]$/g, "");
            return (
              h === "localhost" ||
              h.endsWith(".localhost") ||
              h.endsWith(".local") ||
              h.endsWith(".internal") ||
              h === "0.0.0.0" ||
              h === "::1" ||
              h === "0:0:0:0:0:0:0:1" ||
              h.startsWith("::ffff:") ||
              h.startsWith("fc") ||
              h.startsWith("fd") ||
              h.startsWith("fe80:") ||
              h === "127.0.0.1" ||
              h.startsWith("127.") ||
              h.startsWith("10.") ||
              h.startsWith("192.168.") ||
              h.startsWith("169.254.") ||
              /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) ||
              /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(h)
            );
          };

          if (isBlockedSsrfHost(parsedUrl.hostname)) {
            return NextResponse.json(
              { success: false, message: "Akses ke alamat internal atau privat diblokir demi keamanan." },
              { status: 403 }
            );
          }

          fetchRes = await fetch(targetUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
          });

          if (fetchRes.url) {
            try {
              const finalUrl = new URL(fetchRes.url);
              if (
                (finalUrl.protocol !== "http:" && finalUrl.protocol !== "https:") ||
                isBlockedSsrfHost(finalUrl.hostname)
              ) {
                return NextResponse.json(
                  { success: false, message: "Pengalihan (redirect) ke jaringan internal diblokir demi keamanan." },
                  { status: 403 }
                );
              }
            } catch {
              return NextResponse.json(
                { success: false, message: "URL tujuan akhir tidak valid." },
                { status: 400 }
              );
            }
          }

          if (!fetchRes.ok) {
            return NextResponse.json(
              {
                success: false,
                message: "Gagal mengambil gambar dari tautan tersebut. Tautan mungkin telah kedaluwarsa atau dibatasi oleh pemilik situs. Silakan simpan gambar ke perangkat Anda lalu unggah langsung.",
              },
              { status: 400 }
            );
          }

          const contentLengthHeader = Number(fetchRes.headers.get("content-length") || 0);
          if (
            contextConfig?.maxBytes &&
            contentLengthHeader > contextConfig.maxBytes
          ) {
            return NextResponse.json(
              {
                success: false,
                message: "Ukuran berkas dari tautan melebihi batas maksimal yang diizinkan.",
              },
              { status: 400 }
            );
          }

          const contentType = fetchRes.headers.get("content-type") || "";
          if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Tautan yang dimasukkan bukan file gambar langsung (konten berupa dokumen web HTML). Silakan buka gambar di tab baru lalu salin URL gambar aslinya.",
              },
              { status: 400 }
            );
          }

          declaredType = contentType.split(";")[0].trim();
          arrayBuffer = await fetchRes.arrayBuffer();
          try {
            const pathname = new URL(targetUrl).pathname;
            originalName = pathname.split("/").pop() || "web-image";
          } catch {
            originalName = "web-image";
          }
        }
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            message: `Koneksi gagal saat mengunduh gambar dari tautan: ${err.message}.`,
          },
          { status: 400 }
        );
      }
    }

    const result = await uploadToR2({
      data: arrayBuffer,
      originalName,
      declaredType,
      context: contextKey,
      identifier: typeof identifier === "string" ? identifier.trim() : "",
    });

    let posterUrl = null;
    if (
      result?.mimeType?.startsWith("video/") &&
      posterFile &&
      typeof posterFile !== "string"
    ) {
      try {
        const posterBuffer = await posterFile.arrayBuffer();
        const posterResult = await uploadToR2({
          data: posterBuffer,
          originalName: "poster.webp",
          declaredType: posterFile.type || "image/webp",
          allowedTypes: ["image/jpeg", "image/png", "image/webp"],
          maxBytes: 5 * 1024 * 1024,
          optimize: true,
          maxWidth: 960,
          quality: 80,
          customKey: `${result.key}${VIDEO_POSTER_SUFFIX}`,
        });
        posterUrl = posterResult?.url || null;
      } catch (posterErr) {
        console.warn("Peringatan: Gagal mengunggah cover poster video:", posterErr?.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Berkas berhasil diunggah dan dioptimasi.",
        data: {
          ...result,
          ...(posterUrl ? { posterUrl } : {}),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengunggah berkas. Silakan coba beberapa saat lagi.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { user, errorResponse } = await requireAuth(request, [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
    ]);
    if (errorResponse) return errorResponse;

    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Layanan penyimpanan berkas sedang dalam pemeliharaan.",
        },
        { status: 503 }
      );
    }

    const rateLimitBlocked = checkRateLimit(request, {
      action: "r2_delete",
      limit: 60,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    let targetUrls = [];

    const { searchParams } = new URL(request.url);
    const queryUrl = searchParams.get("url");
    if (queryUrl) {
      targetUrls.push(queryUrl);
    }

    if (targetUrls.length === 0) {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await request.json();
          if (Array.isArray(body?.urls)) {
            targetUrls = body.urls.filter((u) => typeof u === "string");
          } else if (typeof body?.url === "string") {
            targetUrls = [body.url];
          }
        } else {
          const rawText = await request.text();
          if (rawText) {
            try {
              const parsed = JSON.parse(rawText);
              if (Array.isArray(parsed?.urls)) {
                targetUrls = parsed.urls.filter((u) => typeof u === "string");
              } else if (typeof parsed?.url === "string") {
                targetUrls = [parsed.url];
              }
            } catch {
              targetUrls = [rawText.trim()];
            }
          }
        }
      } catch {
      }
    }

    const validUrls = targetUrls.map((u) => String(u).trim()).filter(Boolean);

    if (validUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "URL berkas yang akan dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    await Promise.allSettled(validUrls.map((url) => deleteFromR2(url)));

    return NextResponse.json(
      {
        success: true,
        message: `${validUrls.length} berkas berhasil dihapus dari penyimpanan.`,
        deletedCount: validUrls.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus berkas. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
