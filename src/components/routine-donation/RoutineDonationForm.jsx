"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { RoutineDonationHero } from "@/components/routine-donation/RoutineDonationHero";
import { RoutineDonorIdentity } from "@/components/routine-donation/RoutineDonorIdentity";
import { RoutineProgramItem } from "@/components/routine-donation/RoutineProgramItem";
import { RoutineSummaryCard } from "@/components/routine-donation/RoutineSummaryCard";
import { RoutineSuccessView } from "@/components/routine-donation/RoutineSuccessView";
import { startRoutineTour } from "./routineTour";
import { useRoutineDonation } from "./useRoutineDonation";

export function RoutineDonationForm({ campaigns = [] }) {
  const {
    isLoggedIn,
    currentUser,
    fullName,
    setFullName,
    email,
    setEmail,
    isAnonymous,
    setIsAnonymous,
    errors,
    setErrors,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    activeCampaigns,
    program,
    selectedPrograms,
    totalPerCommitment,
    handleProgramChange,
    handleSubmit,
    existingActiveRoutine,
  } = useRoutineDonation({ campaigns });

  if (isSubmitted) {
    return (
      <RoutineSuccessView
        isAnonymous={isAnonymous}
        fullName={fullName}
        email={email}
        selectedPrograms={selectedPrograms}
        campaigns={activeCampaigns}
        onReset={() => {
          setIsSubmitted(false);
        }}
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      <RoutineDonationHero />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (7 Cols): Donor Identity & Program Selection */}
        <div className="lg:col-span-7 space-y-4">
          {existingActiveRoutine && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 text-slate-800 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm sm:text-base">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {existingActiveRoutine.status === "PAUSED"
                    ? "Jadwal donasi rutin Anda sedang dijeda"
                    : "Jadwal donasi rutin Anda sedang aktif"}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-normal leading-relaxed">
                {existingActiveRoutine.status === "PAUSED" ? (
                  <>
                    Anda memiliki jadwal tersimpan yang sedang dijeda untuk program{" "}
                    <strong className="font-semibold text-slate-900">
                      {existingActiveRoutine.programTitle}
                    </strong>
                    . Aktifkan kembali atau batalkan jadwal tersebut terlebih dahulu jika ingin membuat jadwal baru.
                  </>
                ) : (
                  <>
                    Anda sudah memiliki jadwal aktif untuk program{" "}
                    <strong className="font-semibold text-slate-900">
                      {existingActiveRoutine.programTitle}
                    </strong>
                    . Batalkan jadwal tersebut terlebih dahulu jika ingin membuat jadwal baru.
                  </>
                )}
              </p>
              <div className="pt-1">
                <Link
                  href="/donatur/dashboard#donor-routine-card"
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  Kelola jadwal di dashboard
                </Link>
              </div>
            </div>
          )}

          <RoutineDonorIdentity
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            errors={errors}
            setErrors={setErrors}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
          />

          <RoutineProgramItem
            item={program}
            campaigns={activeCampaigns}
            onChange={handleProgramChange}
            index={0}
          />
        </div>

        {/* Right Column (5 Cols): Sticky Order Summary & Submit Button */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <RoutineSummaryCard
            selectedPrograms={selectedPrograms}
            totalPerCommitment={totalPerCommitment}
            isSubmitting={isSubmitting}
            campaigns={activeCampaigns}
            onStartTour={startRoutineTour}
            existingActiveRoutine={existingActiveRoutine}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </form>
    </main>
  );
}
