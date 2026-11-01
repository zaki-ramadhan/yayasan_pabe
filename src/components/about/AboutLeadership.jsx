import { ORG_PROFILE } from "@/data/orgProfile";
import { LeaderItem } from "./LeaderItem";

export function AboutLeadership({ leaders = [] }) {
  const displayLeaders =
    Array.isArray(leaders) && leaders.length > 0
      ? leaders
      : ORG_PROFILE.leadership || [];

  return (
    <section className="p-4 sm:p-5 space-y-4">
      <h2 className="text-lg sm:text-xl font-medium text-slate-950">
        Struktur Organisasi
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {displayLeaders.map((leader, idx) => (
          <LeaderItem key={leader.id || leader.name || idx} leader={leader} />
        ))}
      </div>
    </section>
  );
}
