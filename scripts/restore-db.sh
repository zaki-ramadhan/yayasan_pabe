#!/bin/bash
# ==============================================================================
# Script Pemulihan Basis Data PostgreSQL (Disaster Recovery & Restore)
# Penggunaan:
#   1. Restore dari file lokal:
#      ./scripts/restore-db.sh /var/backups/yayasan-db/db_yayasan_YYYYMMDD_HHMMSS.sql.gz --confirm
#
#   2. Download backup terbaru dari Cloudflare R2 dan restore:
#      ./scripts/restore-db.sh --from-r2 latest --confirm
# ==============================================================================

set -e

SOURCE_ARG="$1"
CONFIRM_FLAG="$2"

if [ -z "$SOURCE_ARG" ]; then
  echo "❌ Penggunaan:"
  echo "   ./scripts/restore-db.sh <path-to-file.sql.gz> --confirm"
  echo "   ./scripts/restore-db.sh --from-r2 <filename-or-latest> --confirm"
  exit 1
fi

if [ "$CONFIRM_FLAG" != "--confirm" ] && [ "$3" != "--confirm" ]; then
  echo "⚠️ PERINGATAN KESELAMATAN DATA (Anti-Accidental Overwrite):"
  echo "   Proses ini akan menimpa data yang ada pada database target!"
  echo "   Untuk melanjutkan, jalankan perintah dengan menambahkan bendera: --confirm"
  exit 1
fi

# Load DATABASE_URL dari .env jika ada
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -E '^DATABASE_URL=' | xargs)
  export $(grep -v '^#' .env | grep -E '^(R2_ACCOUNT_ID|R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY|R2_BUCKET_NAME)=' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL tidak ditemukan di file .env!"
  exit 1
fi

RESTORE_FILE=""
TEMP_DOWNLOAD=false

if [ "$SOURCE_ARG" == "--from-r2" ]; then
  R2_TARGET="$2"
  if [ -z "$R2_ACCOUNT_ID" ] || [ -z "$R2_ACCESS_KEY_ID" ] || [ -z "$R2_SECRET_ACCESS_KEY" ]; then
    echo "❌ Error: Kredensial Cloudflare R2 tidak lengkap di .env!"
    exit 1
  fi

  R2_BUCKET="${R2_BUCKET_NAME:-ypabe-storage}"
  R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  RESTORE_FILE="/tmp/r2_restore_$(date +%s).sql.gz"
  TEMP_DOWNLOAD=true

  echo "☁️ Mengunduh berkas backup dari Cloudflare R2..."
  if command -v aws >/dev/null 2>&1; then
    AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
    aws s3 cp "s3://${R2_BUCKET}/backups/database/${R2_TARGET}" "${RESTORE_FILE}" \
      --endpoint-url "${R2_ENDPOINT}" \
      --region auto
  elif command -v rclone >/dev/null 2>&1; then
    rclone copyto "r2:${R2_BUCKET}/backups/database/${R2_TARGET}" "${RESTORE_FILE}"
  else
    echo "❌ Error: Diperlukan AWS CLI atau rclone untuk mengunduh arsip dari Cloudflare R2."
    exit 1
  fi
else
  RESTORE_FILE="$SOURCE_ARG"
fi

if [ ! -f "$RESTORE_FILE" ]; then
  echo "❌ Error: Berkas backup tidak ditemukan di: ${RESTORE_FILE}"
  exit 1
fi

echo "🔄 [$(date)] Memulai proses restore ke PostgreSQL..."
gunzip -c "${RESTORE_FILE}" | psql "$DATABASE_URL"

echo "✅ Proses restore database berhasil diselesaikan."

# Verifikasi integritas tabel utama
echo "🔍 Melakukan verifikasi data hasil pemulihan..."
psql "$DATABASE_URL" -c "SELECT count(*) AS total_pengguna FROM \"User\";"
psql "$DATABASE_URL" -c "SELECT count(*) AS total_donasi FROM \"Donation\";"

if [ "$TEMP_DOWNLOAD" = true ] && [ -f "$RESTORE_FILE" ]; then
  rm -f "$RESTORE_FILE"
fi

echo "🎉 Database siap digunakan."
