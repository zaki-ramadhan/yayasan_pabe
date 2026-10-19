import { Skeleton } from "@/components/ui/skeleton";

export default function KalkulatorZakatLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Header Banner - Centered Dark Theme */}
      <div className="relative w-full bg-slate-950 border-b border-slate-800 pt-10 sm:pt-14 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <Skeleton className="h-6 w-44 bg-neutral-800 mx-auto rounded-full" />
          <Skeleton className="h-8 sm:h-10 w-64 bg-neutral-800 mx-auto rounded-lg" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-4 sm:h-5 w-full max-w-2xl bg-neutral-800 mx-auto rounded" />
            <Skeleton className="h-4 sm:h-5 w-3/4 max-w-xl bg-neutral-800 mx-auto rounded" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Tabs & Calculator Layout */}
        <div className="space-y-6">
          {/* Mode Selector Tabs (Centered) */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-slate-100 rounded-md border border-slate-200 gap-1 overflow-x-auto max-w-full">
              <Skeleton className="h-9 w-28 rounded-md bg-neutral-300 shrink-0" />
              <Skeleton className="h-9 w-20 rounded-md shrink-0" />
              <Skeleton className="h-9 w-24 rounded-md shrink-0" />
              <Skeleton className="h-9 w-24 rounded-md shrink-0" />
              <Skeleton className="h-9 w-20 rounded-md shrink-0" />
            </div>
          </div>

          {/* 2-Column Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2">
            {/* Form Inputs (Left: 7 cols - Default Tab: Zakat Penghasilan) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 space-y-6 shadow-xs">
              {/* Form Title & Subtitle */}
              <div className="space-y-1">
                <Skeleton className="h-6 w-44 rounded" />
                <Skeleton className="h-4 w-full max-w-md rounded" />
              </div>

              {/* 2-Column Form Fields: Gaji & Penghasilan Lain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-3 w-56 max-w-full rounded mt-1" />
                </div>
              </div>

              {/* Submit & Reset Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            </div>

            {/* Results Panel (Right: 5 cols - Default Empty State) */}
            <div className="lg:col-span-5 h-full min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center p-8 rounded-lg bg-white border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 mx-auto rounded" />
                <Skeleton className="h-5 w-32 mx-auto rounded" />
              </div>
              <div className="space-y-1 pt-1">
                <Skeleton className="h-4 w-60 mx-auto rounded" />
                <Skeleton className="h-4 w-48 mx-auto rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
