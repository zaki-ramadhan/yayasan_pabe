import { ORG_PROFILE } from "@/data/orgProfile";

export function AboutStory({ orgSettings = null }) {
  const background = orgSettings?.background || ORG_PROFILE.background;

  return (
    <section className="p-4 sm:p-5 space-y-3">
      <h2 className="text-lg sm:text-xl font-medium text-slate-950">
        Tentang Kami
      </h2>
      <div className="text-sm sm:text-base text-slate-800 leading-relaxed space-y-3 whitespace-pre-line">
        {background}
      </div>
    </section>
  );
}
