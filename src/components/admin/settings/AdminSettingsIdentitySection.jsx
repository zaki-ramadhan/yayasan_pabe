"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { sanitizeStandardText } from "@/lib/security";

export function AdminSettingsIdentitySection({ formData, errors = {}, onFieldChange }) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-2.5 border-b border-slate-100">
        <CardTitle className="text-base font-medium text-slate-900 leading-tight">
          Identitas &amp; profil yayasan
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-normal">
          <FormField label="Nama resmi yayasan" required error={errors.name} className="sm:col-span-2">
            <Input
              value={formData.name || ""}
              minLength={FIELD_LIMITS.FOUNDATION_NAME.min}
              maxLength={FIELD_LIMITS.FOUNDATION_NAME.max}
              onChange={(e) => onFieldChange(null, "name", sanitizeStandardText(e.target.value, FIELD_LIMITS.FOUNDATION_NAME.max))}
              onBlur={(e) => onFieldChange(null, "name", e.target.value.trim())}
              placeholder="Contoh: Yayasan Payung Berkah"
              className="h-10 text-sm font-normal"
              required
            />
          </FormField>

          <FormField label="Singkatan / sebutan brand" required error={errors.shortName}>
            <Input
              value={formData.shortName || ""}
              minLength={FIELD_LIMITS.FOUNDATION_SHORT_NAME.min}
              maxLength={FIELD_LIMITS.FOUNDATION_SHORT_NAME.max}
              onChange={(e) => onFieldChange(null, "shortName", sanitizeStandardText(e.target.value, FIELD_LIMITS.FOUNDATION_SHORT_NAME.max))}
              onBlur={(e) => onFieldChange(null, "shortName", e.target.value.trim())}
              placeholder="Contoh: PABE"
              className="h-10 text-sm font-normal"
              required
            />
          </FormField>

          <FormField label="Tagline yayasan">
            <Input
              value={formData.tagline || ""}
              minLength={FIELD_LIMITS.FOUNDATION_TAGLINE.min}
              maxLength={FIELD_LIMITS.FOUNDATION_TAGLINE.max}
              onChange={(e) => onFieldChange(null, "tagline", sanitizeStandardText(e.target.value, FIELD_LIMITS.FOUNDATION_TAGLINE.max))}
              onBlur={(e) => onFieldChange(null, "tagline", e.target.value.trim())}
              placeholder="Tagline atau moto lembaga"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Visi lembaga" className="sm:col-span-2">
            <AutoResizeTextarea
              minRows={2}
              maxRows={8}
              value={formData.vision || ""}
              minLength={FIELD_LIMITS.FOUNDATION_VISION.min}
              maxLength={FIELD_LIMITS.FOUNDATION_VISION.max}
              onChange={(e) => onFieldChange(null, "vision", sanitizeStandardText(e.target.value, FIELD_LIMITS.FOUNDATION_VISION.max))}
              onBlur={(e) => onFieldChange(null, "vision", e.target.value.trim())}
              placeholder="Visi jangka panjang yayasan"
              className="w-full text-sm font-normal border-slate-300"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}


