import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export function RoutineDonationHero() {
  return (
    <div className="space-y-4">
      <Link
        href="/program"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-primary hover:underline transition-colors py-0.5 group"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke program kebaikan</span>
      </Link>
      <PageHeader
        title="Atur jadwal donasi rutin"
        description="Atur kuitansi resmi email dan jadwal donasi berkala untuk program kebaikan pilihan Anda."
      />
    </div>
  );
}
