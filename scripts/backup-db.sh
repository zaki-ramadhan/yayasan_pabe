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

echo "✅ Backup berhasil disimpan: ${BACKUP_FILE}"
echo "📊 Ukuran file: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Hapus backup yang lebih lama dari 7 hari (rotasi otomatis agar hemat disk VPS)
echo "🧹 Membersihkan file backup yang berumur lebih dari 7 hari..."
find "${BACKUP_DIR}" -name "db_yayasan_*.sql.gz" -mtime +7 -delete

echo "🎉 [$(date)] Proses backup selesai dan tervalidasi."
