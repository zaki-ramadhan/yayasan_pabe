import { ORG_PROFILE } from "@/data/orgProfile";
import { LeaderItem } from "./LeaderItem";
import { StructuralDiagramCard } from "./StructuralDiagramCard";

export function AboutLeadership({ leaders = [] }) {
  const displayLeaders =
    Array.isArray(leaders) && leaders.length > 0
      ? leaders
      : ORG_PROFILE.leadership || [];

  const activeStructureImage = ORG_PROFILE.structureImage;

  return (
    <section className="p-4 sm:p-5 space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Struktur Organisasi
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Susunan dewan pengurus dan bagan tata kelola Yayasan Payung Berkah.
        </p>
      </div>

      {activeStructureImage && (
        <StructuralDiagramCard src={activeStructureImage} />
      )}

      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="max-h-[480px] sm:max-h-[520px] overflow-y-auto pr-1.5 focus:outline-none focus:ring-1 focus:ring-slate-300 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {displayLeaders.map((leader, idx) => (
              <LeaderItem key={leader.id || leader.name || idx} leader={leader} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
