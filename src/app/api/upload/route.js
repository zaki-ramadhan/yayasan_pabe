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

    // Role-Based Authorization jika konteks mensyaratkan otentikasi/peran tertentu
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
      // Tolak pengunggahan via URL untuk konteks publik (misal pelamar lowongan kerja)
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
          // Validasi anti-SSRF: Cegah penyerangan ke private network & metadata endpoints
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

          const hostname = parsedUrl.hostname.toLowerCase();
          const isBlockedHost =
            hostname === "localhost" ||
            hostname.endsWith(".localhost") ||
            hostname.endsWith(".local") ||
            hostname === "0.0.0.0" ||
            hostname === "::1" ||
            hostname === "127.0.0.1" ||
            hostname.startsWith("127.") ||
            hostname.startsWith("10.") ||
            hostname.startsWith("192.168.") ||
            hostname.startsWith("169.254.") ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

          if (isBlockedHost) {
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

          if (!fetchRes.ok) {
            return NextResponse.json(
              {
                success: false,
                message: `Gagal mengunduh gambar dari tautan tersebut (Server merespons HTTP ${fetchRes.status} ${fetchRes.statusText}). Tautan mungkin kedaluwarsa atau diblokir oleh pemilik situs. Silakan unduh gambar ke komputer dan unggah langsung.`,
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
