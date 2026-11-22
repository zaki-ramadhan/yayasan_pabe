"use client";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { DatePicker } from "@/components/ui/DatePicker";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { sanitizeStandardText } from "@/lib/sanitizer";
import { validateDisbursementAmount } from "@/lib/distributionConstants";
import { AdminDistributionBudgetInfo } from "./AdminDistributionBudgetInfo";

export function AdminDistributionDetailFields({
  campaignOptions,
  campaignId,
  setCampaignId,
  selectedCampaign,
  disbursedAmount,
  setDisbursedAmount,
  isEditing,
  initialDisbursedAmount,
  currentCampaignBudget,
  title,
  setTitle,
  date,
  setDate,
  content,
  setContent,
  errors,
  setErrors,
}) {
  return (
    <>
      <FormField label="Program donasi" required error={errors.campaignId}>
        <CreatableCombobox
          options={campaignOptions}
          value={campaignId}
          onChange={(val) => {
            setCampaignId(val);
            if (errors.campaignId) {
              setErrors((prev) => ({ ...prev, campaignId: "" }));
            }
          }}
          placeholder="Pilih program asal dana penyaluran..."
          searchPlaceholder="Cari nama program..."
          allowCreate={false}
          className="bg-white"
        />
      </FormField>

      {selectedCampaign && (
        <AdminDistributionBudgetInfo
          campaign={selectedCampaign}
          inputAmount={disbursedAmount}
          isEditing={isEditing}
          initialDisbursedAmount={initialDisbursedAmount}
          onAdjustAmount={(amount) => {
            setDisbursedAmount(amount);
            if (errors.disbursedAmount) {
              setErrors((prev) => ({ ...prev, disbursedAmount: "" }));
            }
          }}
        />
      )}

      <FormField
        label="Judul kegiatan penyaluran"
        required
        error={errors.title}
      >
        <Input
          type="text"
          placeholder="Contoh: Penyerahan Santunan Sembako & Biaya Pendidikan Mustahik"
          value={title}
          minLength={FIELD_LIMITS.DISTRIBUTION_TITLE.min}
          maxLength={FIELD_LIMITS.DISTRIBUTION_TITLE.max}
          onChange={(e) => {
            setTitle(
              sanitizeStandardText(
                e.target.value,
                FIELD_LIMITS.DISTRIBUTION_TITLE.max
              )
            );
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: "" }));
            }
          }}
          onBlur={() => setTitle(title.trim())}
          className="h-10 text-sm font-normal"
          required
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <FormField
          label="Nominal dana tersalurkan"
          required
          error={errors.disbursedAmount}
        >
          <CurrencyInput
            value={disbursedAmount}
            onChange={(val) => {
              setDisbursedAmount(val);
              if (val > 0 && currentCampaignBudget) {
                const check = validateDisbursementAmount(
                  val,
                  currentCampaignBudget.remainingBudget
                );
                setErrors((prev) => ({
                  ...prev,
                  disbursedAmount: check.isValid ? "" : check.error,
                }));
              } else if (errors.disbursedAmount) {
                setErrors((prev) => ({ ...prev, disbursedAmount: "" }));
              }
            }}
            placeholder="0"
            className="h-10 text-sm font-normal"
            required
          />
        </FormField>

        <FormField
          label="Tanggal penyaluran"
          required
          error={errors.date}
        >
          <DatePicker
            value={date}
            onChange={(val) => {
              setDate(val);
              if (errors.date) {
                setErrors((prev) => ({ ...prev, date: "" }));
              }
            }}
            placeholder="Pilih tanggal penyaluran..."
          />
        </FormField>
      </div>

      <FormField
        label="Deskripsi berita & rincian penyaluran"
        required
        error={errors.content}
      >
        <AutoResizeTextarea
          minRows={4}
          maxRows={15}
          minLength={FIELD_LIMITS.DISTRIBUTION_DESCRIPTION.min}
          maxLength={FIELD_LIMITS.DISTRIBUTION_DESCRIPTION.max}
          placeholder="Rincian jumlah penerima manfaat, lokasi penyerahan, dan ucapan doa dari mustahik..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) {
              setErrors((prev) => ({ ...prev, content: "" }));
            }
          }}
          onBlur={() => setContent((prev) => prev.trim())}
          className="w-full text-sm font-normal leading-relaxed border-slate-300"
          required
        />
      </FormField>
    </>
  );
}

