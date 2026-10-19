import { defineConfig, devices } from "@playwright/test";
import fs from "fs";

// Deteksi otomatis lokasi instalasi Brave Browser di sistem
const BRAVE_PATHS = [
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  process.env.LOCALAPPDATA
    ? `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`
    : "",
];

const braveExecutable = BRAVE_PATHS.find((p) => p && fs.existsSync(p));

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    viewport: { width: 1920, height: 1080 },

    launchOptions: {
      slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 250,
      executablePath: braveExecutable || undefined,
      args: ["--start-maximized"],
    },
  },
  projects: [
    {
      name: braveExecutable ? "brave" : "chromium",
    },
  ],

});
