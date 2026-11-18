"use client";

import { useState, useEffect } from "react";
import { CampaignCTA } from "@/components/campaign/CampaignCTA";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  fetchVolunteerStatus,
  cancelVolunteerRegistration,
} from "@/services/volunteerClientService";

import { VolunteerApprovedCard } from "@/components/volunteer/VolunteerApprovedCard";
import { VolunteerPendingCard } from "@/components/volunteer/VolunteerPendingCard";
import { VolunteerCancellationDialog } from "@/components/volunteer/VolunteerCancellationDialog";
import { VolunteerIdCardSkeleton } from "@/components/volunteer/VolunteerIdCard";

export function DonorVolunteerCardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2.5 w-full max-w-xl">
            <Skeleton className="h-3 w-32 bg-slate-800 rounded" />
            <Skeleton className="h-5 sm:h-6 w-48 bg-slate-800 rounded" />
            <Skeleton className="h-4 w-80 max-w-full bg-slate-800/80 rounded" />
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Skeleton className="h-9 w-28 bg-slate-800 rounded-md" />
            <Skeleton className="h-9 w-28 bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>

      <div className="py-2">
        <VolunteerIdCardSkeleton />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <Skeleton className="h-4 w-52 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>
    </div>
  );
}

export function DonorVolunteerCardView() {
  const { currentUser } = useCurrentUser();
  const userEmail = currentUser?.email || "";

  const [volunteer, setVolunteer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!userEmail) {
      return;
    }

    async function load() {
      const res = await fetchVolunteerStatus(userEmail);
      if (isMounted) {
        setVolunteer(res.success && res.data ? res.data : null);
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  const handleConfirmCancel = async () => {
    if (!userEmail) return;

    setCancelling(true);
    try {
      const res = await cancelVolunteerRegistration(userEmail);
      if (res.success) {
        toast.success(res.message);
        setVolunteer(null);
        setIsCancelModalOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses pembatalan.");
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return <DonorVolunteerCardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {!volunteer && (
        <CampaignCTA
          title="Tertarik Bergabung Menjadi Relawan?"
          description="Salurkan keahlian dan waktu Anda dalam program sosial, pendidikan Al-Qur'an, dan aksi kemanusiaan bersama Yayasan Payung Berkah."
          buttonText="Daftar Jadi Relawan Sekarang"
          buttonHref="/relawan"
          ignoreAuthCheck={true}
          variant="emerald"
          campaign={{
            bannerUrl:
              "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
          }}
          className="mt-0"
        />
      )}

      {volunteer && volunteer.isApproved ? (
        <VolunteerApprovedCard
          volunteer={volunteer}
          onResignClick={() => setIsCancelModalOpen(true)}
        />
      ) : volunteer && volunteer.status === "PENDING" ? (
        <VolunteerPendingCard
          volunteer={volunteer}
          onCancelClick={() => setIsCancelModalOpen(true)}
          showViewCardButton={false}
        />
      ) : (
        <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 text-center space-y-1.5 shadow-2xs">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Kartu Relawan Belum Tersedia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Daftar melalui banner di atas untuk mendapatkan kartu relawan resmi.
          </p>
        </div>
      )}

      <VolunteerCancellationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        status={volunteer?.status || "PENDING"}
        isLoading={cancelling}
      />
    </div>
  );
}

export default DonorVolunteerCardView;
