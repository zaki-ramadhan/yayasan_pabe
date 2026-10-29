import { Skeleton } from "@/components/ui/Skeleton";
import { InstagramCardSkeleton } from "./instagram/InstagramCardSkeleton";

/**
 * HomeInstagramSkeleton
 * Skeleton loader kontekstual 1:1 untuk seksi Feed Instagram di Beranda.
 * Merefleksikan SectionHeader terpusat, Profil Card preview gelap dengan arrow pointer,
 * dan photo grid responsif (2 col mobile, 3 col tablet, 4 col desktop).
 */
export function HomeInstagramSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Seksi Terpusat */}
      <div className="text-center space-y-1.5 max-w-2xl mx-auto">
        <Skeleton className="h-8 sm:h-9 lg:h-10 w-64 sm:w-72 mx-auto rounded-lg" />
        <Skeleton className="h-4 sm:h-4.5 w-full max-w-md mx-auto rounded" />
      </div>

      {/* Profil Card Tooltip Preview */}
      <div className="relative py-2 sm:py-3 flex items-center justify-center">
        <div className="relative z-10 w-full flex justify-center">
          <InstagramCardSkeleton />
        </div>
      </div>

      {/* Grid Foto Instagram (2 cols mobile, 3 cols tablet, 4 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square w-full rounded sm:rounded-xl bg-slate-200/80"
          />
        ))}
      </div>
    </section>
  );
}

export default HomeInstagramSkeleton;
