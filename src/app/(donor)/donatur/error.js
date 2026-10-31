"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function DonorSegmentError({ error, reset }) {
  useEffect(() => {
    console.error("[Donor Segment Error]:", error?.message || error);
  }, [error]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Gagal menampilkan data akun donatur
        </h2>

        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          Mohon maaf, data riwayat donasi atau profil Anda sedang tidak dapat diakses saat ini. Silakan coba muat ulang atau kembali ke beranda yayasan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba muat ulang</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
