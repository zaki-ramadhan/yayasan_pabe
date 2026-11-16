import { ORG_PROFILE } from "@/data/orgProfile";
import { LeaderItem } from "./LeaderItem";
import { StructuralDiagramCard } from "./StructuralDiagramCard";

export function AboutLeadership({ leaders = [], structureImage = null }) {
  const displayLeaders =
    Array.isArray(leaders) && leaders.length > 0
      ? leaders
      : ORG_PROFILE.leadership || [];

  const activeStructureImage = structureImage || ORG_PROFILE.structureImage;

  return (
    <section className="p-4 sm:p-5 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Struktur Organisasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Susunan dewan pengurus dan bagan tata kelola Yayasan Payung Berkah.
        </p>
      </div>

      {/* 1. Bagan Visual Struktural */}
      {activeStructureImage && (
        <StructuralDiagramCard src={activeStructureImage} />
      )}

      {/* 2. Daftar Personil Dewan & Pengurus */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h3 className="text-xs sm:text-sm font-medium text-slate-700">
          Dewan Pembina, Pengawas &amp; Pengurus
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {displayLeaders.map((leader, idx) => (
            <LeaderItem key={leader.id || leader.name || idx} leader={leader} />
          ))}
        </div>
      </div>
    </section>
  );
}
