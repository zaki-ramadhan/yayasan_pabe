"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AdminSegmentError({ error, reset }) {
  useEffect(() => {
    // Log context error tanpa membocorkan kredensial sesi
    console.error("[Admin Segment Error]:", error?.message || error);
  }, [error]);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Terjadi kendala saat memuat data modul admin
        </h2>

        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          Bagian ini mengalami kendala teknis sementara. Sesi login dan navigasi Anda tetap aktif. Silakan coba muat ulang komponen ini atau kembali ke ringkasan utama.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba muat ulang bagian ini</span>
          </button>

          <Link
            href="/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Kembali ke dashboard admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
