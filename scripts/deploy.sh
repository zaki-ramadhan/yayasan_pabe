#!/bin/bash
# ==============================================================================
# Script Otomatisasi Deployment VPS (Zero-Downtime Reload)
# Jalankan di VPS: bash scripts/deploy.sh  atau  ./scripts/deploy.sh
# ==============================================================================

set -e

echo "🚀 [1/5] Mengambil pembaruan kode terbaru dari Git..."
git pull origin main

echo "📦 [2/5] Memeriksa & memperbarui dependensi..."
pnpm install --frozen-lockfile

echo "🗄️ [3/5] Sinkronisasi Prisma Client..."
pnpm prisma generate

echo "🏗️ [4/5] Membangun bundle produksi Next.js..."
pnpm build

echo "♻️ [5/5] Memuat ulang aplikasi via PM2 (Zero-Downtime)..."
if pm2 describe yayasan-web > /dev/null 2>&1; then
    pm2 reload yayasan-web --update-env
    echo "✅ Aplikasi berhasil di-reload tanpa downtime!"
else
    pm2 start ecosystem.config.cjs
    echo "✅ Aplikasi berhasil dijalankan pertama kali!"
fi

echo "=============================================================================="
echo "🎉 Deployment selesai! Layanan berjalan normal."
echo "=============================================================================="
