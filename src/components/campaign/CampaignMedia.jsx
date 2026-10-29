import { SafeImage } from "@/components/ui/SafeImage";

export function CampaignMedia({ bannerUrl, title }) {
  return (
    <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-300">
      <SafeImage
        src={bannerUrl}
        alt={title}
        priority
        fallbackText="Foto Dokumentasi Program"
      />
    </div>
  );
}
