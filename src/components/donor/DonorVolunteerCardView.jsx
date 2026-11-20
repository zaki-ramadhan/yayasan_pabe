"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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

export function DonorVolunteerCardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-32 sm:h-28 w-full rounded-md" />
      <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 text-center space-y-4 shadow-2xs">
        <Skeleton className="w-56 h-56 sm:w-72 sm:h-72 mx-auto rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 mx-auto rounded" />
          <Skeleton className="h-4 w-72 max-w-full mx-auto rounded" />
        </div>
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
      ) : volunteer && (volunteer.status === "PENDING" || volunteer.status === "REVIEWED") ? (
        <VolunteerPendingCard
          volunteer={volunteer}
          onCancelClick={() => setIsCancelModalOpen(true)}
          showViewCardButton={false}
        />
      ) : (
        <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-2xs">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto pointer-events-none select-none">
            <Image
              src="/img/illustrations/empty-state.webp"
              alt=""
              fill
              sizes="(max-width: 640px) 224px, 288px"
              className="object-contain pointer-events-none select-none"
              draggable={false}
              aria-hidden="true"
              priority
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Kartu Relawan Belum Tersedia
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Daftar melalui banner di atas untuk mendapatkan kartu relawan resmi.
            </p>
          </div>
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
