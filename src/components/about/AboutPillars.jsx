import { ORG_PROFILE } from "@/data/orgProfile";
import { PillarCard } from "./PillarCard";

const PILLAR_VARIANTS = ["default", "blue", "slate"];

export function AboutPillars() {
  const pillars = ORG_PROFILE.corePillars.slice(0, 3);

  return (
    <section className="p-4 sm:p-5 space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Ruang Lingkup Kegiatan Yayasan
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pillars.map((pillar, idx) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            variant={PILLAR_VARIANTS[idx] || "default"}
          />
        ))}
      </div>
    </section>
  );
}
