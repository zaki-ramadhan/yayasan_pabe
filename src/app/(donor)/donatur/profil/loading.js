import { DonorProfileSkeleton } from "@/components/donor/DonorProfileSkeleton";

export default function DonorProfileLoading() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
          Profil Saya
        </h1>
      </div>
      <DonorProfileSkeleton />
    </div>
  );
}
