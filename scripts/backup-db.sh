#!/bin/bash
# ==============================================================================
# Script Otomatisasi Backup Database PostgreSQL (pg_dump + gzip + auto-prune 7 hari)
# Jadwalkan via crontab di VPS (misal tiap jam 02:00 malam):
# 0 2 * * * /path/to/project/scripts/backup-db.sh >> /var/log/backup-yayasan.log 2>&1
# ==============================================================================

set -e

# Lokasi folder backup
BACKUP_DIR="/var/backups/yayasan-db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_yayasan_${TIMESTAMP}.sql.gz"

# Buat direktori jika belum ada
mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date)] Memulai pencadangan database..."

# Load DATABASE_URL dari .env jika ada
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -E '^DATABASE_URL=' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL tidak ditemukan di file .env!"
  exit 1
fi

# Jalankan pg_dump dengan kompresi gzip langsung
pg_dump "$DATABASE_URL" | gzip > "${BACKUP_FILE}"

echo "✅ Backup berhasil disimpan secara lokal: ${BACKUP_FILE}"
echo "📊 Ukuran file: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Replikasi Offsite ke Cloudflare R2 jika kredensial R2 tersedia di .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -E '^(R2_ACCOUNT_ID|R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY|R2_BUCKET_NAME)=' | xargs)
fi

if [ -n "$R2_ACCOUNT_ID" ] && [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ]; then
  R2_BUCKET="${R2_BUCKET_NAME:-ypabe-storage}"
  R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  R2_TARGET_KEY="backups/database/$(basename "${BACKUP_FILE}")"

  echo "☁️ Mengunggah arsip pencadangan ke Cloudflare R2 (${R2_TARGET_KEY})..."
  if command -v aws >/dev/null 2>&1; then
    AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
    AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
    aws s3 cp "${BACKUP_FILE}" "s3://${R2_BUCKET}/${R2_TARGET_KEY}" \
      --endpoint-url "${R2_ENDPOINT}" \
      --region auto \
      --quiet
    echo "✅ Replikasi offsite ke Cloudflare R2 berhasil."
  elif command -v rclone >/dev/null 2>&1; then
    rclone copyto "${BACKUP_FILE}" "r2:${R2_BUCKET}/${R2_TARGET_KEY}" --quiet
    echo "✅ Replikasi offsite ke Cloudflare R2 berhasil via rclone."
  else
    echo "ℹ️ Catatan: CLI 'aws' atau 'rclone' belum terpasang di VPS untuk upload offsite otomatis."
  fi
fi

# Hapus backup yang lebih lama dari 7 hari (rotasi otomatis agar hemat disk VPS)
echo "🧹 Membersihkan file backup yang berumur lebih dari 7 hari..."
find "${BACKUP_DIR}" -name "db_yayasan_*.sql.gz" -mtime +7 -delete

echo "🎉 [$(date)] Proses backup selesai dan tervalidasi."
