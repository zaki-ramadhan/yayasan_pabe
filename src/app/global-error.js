"use client";

import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 antialiased">
        <main className="w-full max-w-md text-center bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" aria-hidden="true" />
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-slate-950 mb-2">
            Terjadi Kendala Sistem
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
            Aplikasi mengalami kendala saat memuat halaman. Silakan muat ulang halaman atau coba beberapa saat lagi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
