import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignDetailLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Main 2-Column Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Media, Header, Tabs, Story */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Visual Banner */}
          <div className="relative aspect-video w-full rounded-2xl border border-slate-300 bg-slate-100 overflow-hidden">
            <Skeleton className="w-full h-full rounded-none" />
          </div>

          {/* Campaign Header Meta */}
          <div className="space-y-3 pt-1">
            <div className="space-y-2">
              <Skeleton className="h-8 sm:h-9 w-full rounded-lg" />
              <Skeleton className="h-8 sm:h-9 w-3/4 rounded-lg" />
            </div>

            <div className="flex items-center gap-2.5 text-sm sm:text-base pt-0.5">
              <Skeleton className="h-5 w-28 rounded" />
              <span className="text-slate-300 select-none">|</span>
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-5 w-32 rounded" />
              </div>
            </div>

            <div className="space-y-1.5 pt-0.5">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
            </div>
          </div>

          {/* Mobile-Only Donation Metrics Placeholder */}
          <div className="lg:hidden p-5 bg-white rounded-xl border border-slate-300 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-8 w-44 rounded-md" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>

          {/* Tabs Bar Placeholder */}
          <div className="border-b border-slate-300 pb-0 pt-2 flex items-center gap-6 overflow-x-auto">
            <Skeleton className="h-9 w-28 rounded-t-md" />
            <Skeleton className="h-9 w-36 rounded-t-md" />
            <Skeleton className="h-9 w-32 rounded-t-md" />
          </div>

          {/* Story Paragraphs Skeleton */}
          <div className="space-y-3.5 pt-2">
            <Skeleton className="h-4.5 w-full rounded" />
            <Skeleton className="h-4.5 w-full rounded" />
            <Skeleton className="h-4.5 w-5/6 rounded" />
            <Skeleton className="h-4.5 w-full rounded" />
            <Skeleton className="h-4.5 w-4/5 rounded" />
          </div>

          {/* Persistent CTA Box Placeholder */}
          <div className="p-5 sm:p-6 rounded-xl border border-slate-300 bg-white space-y-3">
            <Skeleton className="h-6 w-64 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
        </div>

        {/* Right Column: Sticky Donation Panel & Doa Chat Sidebar */}
        <div className="lg:col-span-4 hidden lg:block space-y-4 sticky top-24">
          {/* Sticky Donation Card */}
          <div className="p-6 sm:p-7 bg-white rounded-xl border border-slate-300 space-y-4 shadow-xs">
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-9 w-48 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between items-center pt-0.5">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
            </div>

            {/* 2-Column Metrics */}
            <div className="grid grid-cols-2 divide-x divide-slate-200 py-3.5 border-y border-slate-200">
              <div className="pr-3 space-y-1 text-center flex flex-col items-center">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <div className="pl-3 space-y-1 text-center flex flex-col items-center">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
            </div>

            {/* CTA Button */}
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-3.5 w-44 mx-auto rounded" />
          </div>

          {/* Doa-Doa Orang Baik Sidebar Widget (Mirrors WhatsApp-style Chat Room) */}
          <div className="space-y-3">
            {/* Widget Header: Title + Sort Control */}
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            {/* Chat Room Container */}
            <div className="relative rounded-2xl border border-neutral-300 overflow-hidden shadow-xs bg-neutral-900 flex flex-col min-h-[440px] max-h-[580px]">
              {/* Messages area */}
              <div className="p-3.5 space-y-4 flex-1">
                {/* Date sticky badge */}
                <div className="flex justify-center">
                  <Skeleton className="h-5 w-24 rounded-full bg-neutral-800" />
                </div>

                {/* Incoming bubble (left) */}
                <div className="flex flex-col items-start w-full">
                  <div className="pl-[36px] mb-1">
                    <Skeleton className="h-3 w-24 bg-neutral-800 rounded" />
                  </div>
                  <div className="flex items-end gap-2 w-full">
                    <Skeleton className="w-7 h-7 rounded-full bg-neutral-800 shrink-0" />
                    <div className="flex flex-col max-w-[82%] sm:max-w-[78%] items-start">
                      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl rounded-bl-xs p-3 space-y-2 w-56 shadow-2xs">
                        <Skeleton className="h-3.5 w-full bg-neutral-700/80 rounded" />
                        <Skeleton className="h-3.5 w-4/5 bg-neutral-700/80 rounded" />
                        <div className="flex justify-end pt-0.5">
                          <Skeleton className="h-2.5 w-10 bg-neutral-700/60 rounded" />
                        </div>
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-5 w-16 rounded-full bg-neutral-800 border border-neutral-700/70" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outgoing bubble (right) */}
                <div className="flex flex-col items-end w-full">
                  <div className="pr-[36px] mb-1">
                    <Skeleton className="h-3 w-20 bg-neutral-800 rounded" />
                  </div>
                  <div className="flex items-end gap-2 w-full flex-row-reverse">
                    <Skeleton className="w-7 h-7 rounded-full bg-neutral-800 shrink-0" />
                    <div className="flex flex-col max-w-[82%] sm:max-w-[78%] items-end">
                      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl rounded-br-xs p-3 space-y-2 w-52 shadow-2xs">
                        <Skeleton className="h-3.5 w-full bg-neutral-700/80 rounded" />
                        <Skeleton className="h-3.5 w-3/4 bg-neutral-700/80 rounded" />
                        <div className="flex justify-end pt-0.5">
                          <Skeleton className="h-2.5 w-10 bg-neutral-700/60 rounded" />
                        </div>
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-5 w-16 rounded-full bg-neutral-800 border border-neutral-700/70" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Incoming bubble (left) */}
                <div className="flex flex-col items-start w-full">
                  <div className="pl-[36px] mb-1">
                    <Skeleton className="h-3 w-28 bg-neutral-800 rounded" />
                  </div>
                  <div className="flex items-end gap-2 w-full">
                    <Skeleton className="w-7 h-7 rounded-full bg-neutral-800 shrink-0" />
                    <div className="flex flex-col max-w-[82%] sm:max-w-[78%] items-start">
                      <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl rounded-bl-xs p-3 space-y-2 w-60 shadow-2xs">
                        <Skeleton className="h-3.5 w-full bg-neutral-700/80 rounded" />
                        <Skeleton className="h-3.5 w-5/6 bg-neutral-700/80 rounded" />
                        <div className="flex justify-end pt-0.5">
                          <Skeleton className="h-2.5 w-10 bg-neutral-700/60 rounded" />
                        </div>
                      </div>
                      <div className="mt-1">
                        <Skeleton className="h-5 w-16 rounded-full bg-neutral-800 border border-neutral-700/70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar Footer */}
              <div className="p-2 sm:px-2.5 sm:pb-2.5 sm:pt-1">
                <div className="h-10 rounded-full bg-neutral-800/90 border border-neutral-700/80 flex items-center justify-between px-3.5">
                  <Skeleton className="h-3.5 w-44 bg-neutral-700 rounded" />
                  <Skeleton className="h-7 w-7 rounded-full bg-neutral-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

