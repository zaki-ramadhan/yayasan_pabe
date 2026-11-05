import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { checkRateLimit } from "@/lib/rateLimit";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "ypabe-storage";

let r2Client = null;
function getClient() {
  if (!r2Client && accountId && accessKeyId && secretAccessKey) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return r2Client;
}

/**
 * Media Proxy Route untuk Cloudflare R2 Storage.
 * Mengatasi pemblokiran domain publik *.r2.dev oleh ISP Indonesia (Internet Positif / Telkomsel / Indihome)
 * dengan menyajikan berkas langsung melalui endpoint aplikasi internal.
 */
export async function GET(request, { params }) {
  const rateLimitBlocked = checkRateLimit(request, {
    action: "media_proxy",
    limit: 180,
    windowMs: 60000,
  });
  if (rateLimitBlocked) return rateLimitBlocked;

  const { path } = await params;
  if (!path || !path.length) {
    return new NextResponse("Berkas tidak ditemukan", { status: 404 });
  }

  let rawPath = [...path];
  const lastSegment = rawPath[rawPath.length - 1];
  if (lastSegment === "stream" || lastSegment === "play") {
    rawPath.pop();
  }

  // 1. Anti Path-Traversal Guard
  if (rawPath.some((seg) => seg === ".." || seg === "." || seg.includes("\\") || seg.includes("\0"))) {
    return new NextResponse("Akses path tidak valid", { status: 400 });
  }

  const key = rawPath.join("/");

  // 2. Proteksi Mutlak: Larangan akses publik ke arsip pencadangan database
  if (key.startsWith("backups/") || key.startsWith("backups")) {
    return new NextResponse("Akses ke direktori arsip pencadangan dilarang (Forbidden)", { status: 403 });
  }

  // 3. Kepatuhan UU PDP No. 27/2022: Akses berkas resume pelamar (PII) khusus administrator
  const isResume = key.startsWith("careers/resumes/");
  if (isResume) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return new NextResponse("Autentikasi administrator diperlukan untuk mengakses berkas resume pelamar", { status: 401 });
    }
    if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN) {
      return new NextResponse("Hanya administrator yang berwenang mengakses berkas resume pelamar", { status: 403 });
    }
  }

  try {
    const client = getClient();
    if (!client) {
      return new NextResponse("Layanan penyimpanan R2 belum dikonfigurasi", { status: 503 });
    }

    const rangeHeader = request.headers.get("range");
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      Range: rangeHeader || undefined,
    });
    const response = await client.send(command);

    const ext = key.split(".").pop().toLowerCase();
    const MIME_TYPES = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      ogg: "video/ogg",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
    };

    const resolvedContentType =
      response.ContentType && response.ContentType !== "application/octet-stream"
        ? response.ContentType
        : (MIME_TYPES[ext] || "application/octet-stream");

    const fileName = key.split("/").pop() || "media";

    const headers = new Headers();
    headers.set("Content-Type", resolvedContentType);
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
    headers.set(
      "Cache-Control",
      isResume ? "private, no-cache, no-store, must-revalidate" : "public, max-age=31536000, immutable"
    );
    headers.set("Accept-Ranges", "bytes");
    if (response.ContentLength) {
      headers.set("Content-Length", String(response.ContentLength));
    }
    if (response.ContentRange) {
      headers.set("Content-Range", response.ContentRange);
    }

    const statusCode = rangeHeader && response.ContentRange ? 206 : 200;

    return new NextResponse(response.Body.transformToWebStream(), {
      status: statusCode,
      headers,
    });
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return new NextResponse("Berkas tidak ditemukan di penyimpanan R2", { status: 404 });
    }
    console.error(`Media proxy error for key [${key}]:`, error.message);
    return new NextResponse("Gagal memuat berkas dari penyimpanan R2", { status: 500 });
  }
}
