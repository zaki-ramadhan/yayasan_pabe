import { ORG_PROFILE } from "@/data/orgProfile";
import { LeaderItem } from "./LeaderItem";

export function AboutLeadership() {
  return (
    <section className="p-4 sm:p-5 space-y-4">
      <h2 className="text-lg sm:text-xl font-medium text-slate-950">
        Struktur Organisasi
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {ORG_PROFILE.leadership.map((leader) => (
          <LeaderItem key={leader.name} leader={leader} />
        ))}
      </div>
    </section>
  );
}
