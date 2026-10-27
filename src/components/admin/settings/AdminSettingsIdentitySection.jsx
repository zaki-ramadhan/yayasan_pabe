"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
              onChange={(e) => onFieldChange(null, "name", sanitizeStandardText(e.target.value, 80))}
              onBlur={(e) => onFieldChange(null, "name", e.target.value.trim())}
              placeholder="Contoh: Yayasan Payung Berkah"
              className="h-10 text-sm font-normal"
              required
            />
          </FormField>

          <FormField label="Singkatan / sebutan brand" required error={errors.shortName}>
            <Input
              value={formData.shortName || ""}
              onChange={(e) => onFieldChange(null, "shortName", sanitizeStandardText(e.target.value, 20))}
              onBlur={(e) => onFieldChange(null, "shortName", e.target.value.trim())}
              placeholder="Contoh: PABE"
              className="h-10 text-sm font-normal"
              required
            />
          </FormField>

          <FormField label="Tagline yayasan">
            <Input
              value={formData.tagline || ""}
              onChange={(e) => onFieldChange(null, "tagline", sanitizeStandardText(e.target.value, 120))}
              onBlur={(e) => onFieldChange(null, "tagline", e.target.value.trim())}
              placeholder="Tagline atau moto lembaga"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Visi lembaga" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={formData.vision || ""}
              onChange={(e) => onFieldChange(null, "vision", sanitizeStandardText(e.target.value, 300))}
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


