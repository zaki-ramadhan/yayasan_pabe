/**
 * PM2 Process Management Configuration for Production Deployment
 * Run: pm2 start ecosystem.config.cjs
 * Reload zero-downtime: pm2 reload yayasan-web
 */

module.exports = {
  apps: [
    {
      name: "yayasan-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./",
      instances: "max", // Menjalankan cluster mode sesuai jumlah core CPU server
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M", // Restart otomatis jika memori bocor melebihi 500MB
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
