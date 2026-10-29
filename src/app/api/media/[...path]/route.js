import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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
  const { path } = await params;
  if (!path || !path.length) {
    return new NextResponse("Berkas tidak ditemukan", { status: 404 });
  }

  let rawPath = [...path];
  const lastSegment = rawPath[rawPath.length - 1];
  if (lastSegment === "stream" || lastSegment === "play") {
    rawPath.pop();
  }

  const key = rawPath.join("/");

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
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
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
