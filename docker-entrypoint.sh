#!/bin/sh
set -e

# Opsional: sinkronisasi skema database secara otomatis jika flag RUN_DB_PUSH diaktifkan
if [ "$RUN_DB_PUSH" = "true" ]; then
  echo "=> Menjalankan sinkronisasi skema database via Prisma..."
  (cd /opt/prisma-cli && node node_modules/prisma/build/index.js db push) || echo "Peringatan: Gagal menjalankan prisma db push otomatis, melanjutkan start server."
fi

exec "$@"
