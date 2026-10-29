import { Skeleton } from "@/components/ui/Skeleton";

export default function VolunteerLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Editorial & Value Prop */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Cover Image Skeleton */}
          <Skeleton className="relative w-full h-36 sm:h-44 rounded-xl sm:rounded-2xl" />

          <Skeleton className="h-8 sm:h-10 w-80 max-w-full rounded-lg" />

          {/* Perks List: 3 Editorial items without icons */}
          <div className="divide-y divide-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Volunteer Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>

          {/* WhatsApp & Email (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>

          {/* City & Interest (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          </div>

          {/* Motivation Textarea */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Submit Button */}
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
