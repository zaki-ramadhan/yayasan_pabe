"use client";

import { Plus } from "lucide-react";
import { RoutineDonationHero } from "@/components/routine-donation/RoutineDonationHero";
import { RoutineDonorIdentity } from "@/components/routine-donation/RoutineDonorIdentity";
import { RoutineProgramItem } from "@/components/routine-donation/RoutineProgramItem";
import { RoutineSummaryCard } from "@/components/routine-donation/RoutineSummaryCard";
import { RoutineSuccessView } from "@/components/routine-donation/RoutineSuccessView";
import { startRoutineTour } from "./routineTour";
import { useRoutineDonation } from "./useRoutineDonation";

export function RoutineDonationForm({ campaigns = [] }) {
  const {
    salutation,
    setSalutation,
    fullName,
    setFullName,
    whatsapp,
    setWhatsapp,
    isAnonymous,
    setIsAnonymous,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    activeCampaigns,
    selectedPrograms,
    totalPerCommitment,
    handleAddProgram,
    handleRemoveProgram,
    handleProgramChange,
    handleSubmit,
  } = useRoutineDonation({ campaigns });

  if (isSubmitted) {
    return (
      <RoutineSuccessView
        isAnonymous={isAnonymous}
        salutation={salutation}
        fullName={fullName}
        whatsapp={whatsapp}
        selectedPrograms={selectedPrograms}
        campaigns={activeCampaigns}
        onReset={() => {
          setIsSubmitted(false);
        }}
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <RoutineDonationHero />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (7 Cols): Donor Identity & Program Selection */}
        <div className="lg:col-span-7 space-y-6">
          <RoutineDonorIdentity
            salutation={salutation}
            setSalutation={setSalutation}
            fullName={fullName}
            setFullName={setFullName}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
          />

          {/* Step 2: Selected Programs Selection List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-slate-950">
                Pilihan Program &amp; Jadwal Donasi
              </h2>
              <span className="text-sm text-slate-600 font-normal">
                {selectedPrograms.length} dari 2 program
              </span>
            </div>

            {selectedPrograms.map((item, index) => (
              <RoutineProgramItem
                key={item.id}
                item={item}
                index={index}
                totalItems={selectedPrograms.length}
                campaigns={activeCampaigns}
                onRemove={handleRemoveProgram}
                onChange={handleProgramChange}
              />
            ))}

            {/* Add program button (max 2) */}
            {selectedPrograms.length < 2 && (
              <button
                id="tour-add-program"
                type="button"
                onClick={handleAddProgram}
                className="w-full h-11 px-4 rounded-lg border border-dashed border-slate-300 hover:border-primary text-slate-700 hover:text-primary bg-white hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Program Lain (Maks. 2)</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Sticky Order Summary & Submit Button */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <RoutineSummaryCard
            selectedPrograms={selectedPrograms}
            totalPerCommitment={totalPerCommitment}
            isSubmitting={isSubmitting}
            campaigns={activeCampaigns}
            onStartTour={startRoutineTour}
          />
        </div>
      </form>
    </main>
  );
}
