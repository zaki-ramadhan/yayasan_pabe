"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CareerApplySuccessState({ job, onClose }) {
  return (
    <div className="py-6 flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        Jazakumullahu Khairan
      </h3>
      <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
        Lamaran Anda untuk posisi <strong>{job.title}</strong> telah berhasil kami terima.
        Tim rekrutmen akan meninjau kualifikasi Anda dan menghubungi via WhatsApp atau email.
      </p>
      <Button
        type="button"
        onClick={onClose}
        className="mt-4 bg-primary hover:bg-primary-hover text-white text-xs h-9 px-6 rounded-lg font-medium"
      >
        Tutup &amp; Selesai
      </Button>
    </div>
  );
}
