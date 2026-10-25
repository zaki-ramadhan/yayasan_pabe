import { Skeleton } from "@/components/ui/skeleton";
import { DashedDivider } from "@/components/ui/DashedDivider";

export default function TentangKamiLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 animate-pulse">
      {/* 1. Profile Header Card */}
      <section className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
        {/* Banner */}
        <div className="relative h-40 sm:h-52 lg:h-60 w-full bg-slate-200">
          <Skeleton className="w-full h-full rounded-none" />
        </div>

        {/* Profile Details */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 -mt-12 sm:-mt-14 mb-3.5">
            {/* Logo Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white shadow-md shrink-0 flex items-center justify-center p-1">
              <Skeleton className="w-full h-full rounded-full" />
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <Skeleton className="h-9 sm:h-10 w-32 rounded-lg" />
              <Skeleton className="h-9 sm:h-10 w-36 rounded-lg" />
              <Skeleton className="h-9 sm:h-10 w-32 rounded-lg" />
              <Skeleton className="h-9 sm:h-10 w-10 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 sm:h-8 w-80 max-w-full rounded-md" />
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full max-w-2xl rounded" />

            {/* Legal Tags & Volunteer Avatar Stack Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-36 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <Skeleton className="w-6 h-6 rounded-full border-2 border-white" />
                  <Skeleton className="w-6 h-6 rounded-full border-2 border-white" />
                  <Skeleton className="w-6 h-6 rounded-full border-2 border-white" />
                </div>
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Editorial 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Main Column (8 Cols): Unified Editorial Section with Dashed Dividers */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          {/* Section 1: Story */}
          <div className="p-4 sm:p-5 space-y-3">
            <Skeleton className="h-6 w-44 rounded-md" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>

          <DashedDivider className="px-4 sm:px-5" />

          {/* Section 2: Vision & Mission */}
          <div className="p-4 sm:p-5 space-y-4">
            <Skeleton className="h-6 w-36 rounded-md" />

            {/* Visi Callout */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-l-4 border-slate-300 rounded-r-md space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>

            {/* Misi List */}
            <div className="space-y-2.5 pt-1">
              <Skeleton className="h-4 w-16 rounded" />
              <div className="space-y-2 pl-4">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-11/12 rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            </div>
          </div>

          <DashedDivider className="px-4 sm:px-5" />

          {/* Section 3: 4 Pillars */}
          <div className="p-4 sm:p-5 space-y-4">
            <Skeleton className="h-6 w-52 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-5 w-28 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-full rounded" />
                  <Skeleton className="h-3.5 w-4/5 rounded" />
                </div>
              ))}
            </div>
          </div>

          <DashedDivider className="px-4 sm:px-5" />

          {/* Section 4: Leadership Team */}
          <div className="p-4 sm:p-5 space-y-4">
            <Skeleton className="h-6 w-72 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3.5 p-2">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4.5 w-32 rounded" />
                    <Skeleton className="h-3.5 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DashedDivider className="px-4 sm:px-5" />

          {/* Section 5: Official Bank Accounts */}
          <div className="p-4 sm:p-5 space-y-4">
            <Skeleton className="h-6 sm:h-7 w-56 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
              {/* Left Showcase Skeleton */}
              <div className="hidden md:flex md:col-span-6 h-72 sm:h-80 md:h-[340px] items-center justify-center">
                <Skeleton className="w-full h-full rounded-2xl" />
              </div>

              {/* Right Bank Accounts Skeleton (2 Akun: BRI & Mandiri) */}
              <div className="md:col-span-6 space-y-4 md:text-right md:mr-2">
                <div className="space-y-1 md:text-right">
                  <Skeleton className="h-4 sm:h-5 w-44 md:ml-auto rounded" />
                  <Skeleton className="h-6 sm:h-7 w-56 md:ml-auto rounded" />
                  <Skeleton className="h-3.5 sm:h-4 w-36 md:ml-auto rounded" />
                </div>
                <div className="space-y-1 md:text-right pt-3.5 border-t border-slate-200">
                  <Skeleton className="h-4 sm:h-5 w-32 md:ml-auto rounded" />
                  <Skeleton className="h-6 sm:h-7 w-52 md:ml-auto rounded" />
                  <Skeleton className="h-3.5 sm:h-4 w-36 md:ml-auto rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column (4 Cols): Unified Sidebar Card */}
        <aside className="lg:col-span-4 sticky top-20">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-300 space-y-4 shadow-2xs">
            {/* Legalitas & Sertifikasi */}
            <div className="space-y-3.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <div className="space-y-3">
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-40 rounded" />
                  <Skeleton className="h-4 w-44 rounded" />
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-52 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-3.5 w-48 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Narahubung & Sekretariat */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <Skeleton className="h-5 w-48 rounded-md" />
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <Skeleton className="w-4 h-4 rounded shrink-0 mt-0.5" />
                  <Skeleton className="h-3.5 w-full rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-36 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-32 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-40 rounded" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg mt-2" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
