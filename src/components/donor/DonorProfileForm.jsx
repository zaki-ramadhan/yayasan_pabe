"use client";

import { DonorPersonalFormCard } from "@/components/donor/DonorPersonalFormCard";
import { DonorBankFormCard } from "@/components/donor/DonorBankFormCard";
import { DonorSecurityFormCard } from "@/components/donor/DonorSecurityFormCard";

export function DonorProfileForm({
  profile,
  onUpdateProfile,
  onUpdatePassword,
}) {
  return (
    <div className="space-y-6">
      <DonorPersonalFormCard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />
      <DonorBankFormCard
        profile={profile}
        onUpdateProfile={onUpdateProfile}
      />
      <DonorSecurityFormCard
        onUpdatePassword={onUpdatePassword}
      />
    </div>
  );
}
