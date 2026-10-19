import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCardSkeleton } from "@/components/shared/ArticleCardSkeleton";

export default function ArtikelDetailLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5 animate-pulse">
      {/* 1. Back Link */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-44 rounded" />
      </div>

      {/* 2. Title & Metadata Header */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-9 w-full rounded-lg" />
          <Skeleton className="h-7 sm:h-9 w-3/4 rounded-lg" />
        </div>

        {/* Metadata Header (Category | Author | Date) */}
        <div className="flex items-center gap-3 text-xs sm:text-sm pt-0.5">
          <Skeleton className="h-4 w-24 rounded" />
          <span className="text-neutral-300 select-none">|</span>
          <Skeleton className="h-4 w-32 rounded" />
          <span className="text-neutral-300 select-none">|</span>
          <Skeleton className="h-4 w-36 rounded" />
        </div>
      </div>

      {/* 3. Featured Image & Caption */}
      <figure className="space-y-1.5">
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
        <Skeleton className="h-3 w-36 rounded" />
      </figure>

      {/* 4. Article Content Paragraphs */}
      <div className="space-y-3.5 pt-1">
        <Skeleton className="h-4.5 w-full rounded" />
        <Skeleton className="h-4.5 w-full rounded" />
        <Skeleton className="h-4.5 w-5/6 rounded" />
        <Skeleton className="h-4.5 w-full rounded" />
        <Skeleton className="h-4.5 w-4/5 rounded" />
        <Skeleton className="h-4.5 w-full rounded" />
        <Skeleton className="h-4.5 w-3/4 rounded" />
      </div>

      {/* 5. Topic Tags */}
      <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-neutral-200">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>

      {/* 6. Interactive Action Bar (Like, Dislike, Share) */}
      <div className="flex items-center justify-between py-3 border-y border-neutral-200">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* 7. Related Articles (2 items with ArticleCardSkeleton) */}
      <section className="space-y-3 pt-6 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[1, 2].map((i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* 8. Donation Promo CTA Box */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 shadow-md mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-64 rounded bg-neutral-800" />
          <Skeleton className="h-3.5 w-full max-w-md rounded bg-neutral-800" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg bg-neutral-800 shrink-0" />
      </div>
    </main>
  );
}
