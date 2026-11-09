#!/bin/sh
set -e

# Opsional: sinkronisasi skema database secara otomatis jika flag RUN_DB_PUSH diaktifkan
if [ "$RUN_DB_PUSH" = "true" ]; then
  echo "=> Menjalankan sinkronisasi skema database via Prisma..."
  ./node_modules/.bin/prisma db push --skip-generate || echo "Peringatan: Gagal menjalankan prisma db push otomatis, melanjutkan start server."
fi

exec "$@"
