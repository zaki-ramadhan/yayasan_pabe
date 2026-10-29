"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, MessageCircle } from "lucide-react";
import { getFoundationWhatsAppUrl } from "@/lib/whatsappUtils";

export default function Error({ error, reset }) {
  useEffect(() => {
    // In production, send to error monitoring service without leaking sensitive data
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md text-center bg-white p-6 sm:p-8 rounded-lg border border-slate-300">
        <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        
        <h1 className="text-2xl font-semibold text-slate-950 mb-2">
          Sistem Sedang Gangguan
        </h1>
        
        <p className="text-base text-slate-700 mb-6 leading-relaxed">
          Mohon maaf atas ketidaknyamanannya. Tim teknis kami telah menerima laporan ini. Silakan coba muat ulang atau hubungi layanan bantuan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Coba Muat Ulang
          </button>
          
          <a
            href={getFoundationWhatsAppUrl("Halo Admin Yayasan Payung Berkah, saya mengalami kendala di website")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-medium rounded-lg transition-colors"
          >
            Bantuan WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
