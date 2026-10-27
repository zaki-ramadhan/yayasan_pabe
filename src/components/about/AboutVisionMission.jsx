import { ORG_PROFILE } from "@/data/orgProfile";

export function AboutVisionMission({ orgSettings = null }) {
  const vision = orgSettings?.vision || ORG_PROFILE.vision;
  const missions =
    Array.isArray(orgSettings?.missions) && orgSettings.missions.length > 0
      ? orgSettings.missions
      : ORG_PROFILE.missions;

  return (
    <section className="p-4 sm:p-5 space-y-5">
      {/* 1. Maksud dan Tujuan */}
      <div className="space-y-3">
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Maksud dan Tujuan
        </h2>
        <ol className="space-y-2 list-decimal list-outside pl-5 text-sm sm:text-base text-slate-800">
          {ORG_PROFILE.goals.map((g, idx) => (
            <li key={idx} className="leading-relaxed">
              <span className="font-normal">{g}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 2. Visi & Misi */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-base sm:text-lg font-medium text-slate-950">
          Visi &amp; Misi
        </h3>

        {/* Visi */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-l-4 border-primary rounded-r-md space-y-1">
          <span className="text-sm font-medium text-primary block">
            Visi
          </span>
          <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
            &ldquo;{vision}&rdquo;
          </p>
        </div>

        {/* Misi */}
        <div className="space-y-2.5 pt-1">
          <span className="text-sm font-medium text-primary block">
            Misi
          </span>
          <ol className="space-y-2 list-decimal list-outside pl-5 text-sm sm:text-base text-slate-800">
            {missions.map((m, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-normal">{m}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
