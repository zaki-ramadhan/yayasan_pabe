"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home, MessageCircle } from "lucide-react";
import { getFoundationWhatsAppUrl } from "@/lib/whatsappUtils";

export default function InvoiceSegmentError({ error, reset }) {
  useEffect(() => {
    console.error("[Invoice Segment Error]:", error?.message || error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md text-center bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Gagal memuat rincian invoice
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Terjadi kendala saat memeriksa status tagihan donasi Anda. Jika Anda telah melakukan pembayaran, dana Anda tetap aman. Silakan muat ulang atau hubungi layanan bantuan kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba muat ulang</span>
          </button>

          <a
            href={getFoundationWhatsAppUrl("Halo Admin Yayasan, saya mengalami kendala saat membuka halaman tagihan/invoice donasi")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Bantuan WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}
