"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { sanitizeStandardText, sanitizeNPWP } from "@/lib/security";

export function AdminSettingsLegalSection({ formData, errors = {}, onFieldChange }) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-2.5 border-b border-slate-100">
        <CardTitle className="text-base font-medium text-slate-900 leading-tight">
          Legalitas &amp; perizinan resmi
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-sm font-normal">
          <FormField label="SK Kemenkumham RI" error={errors.skKemenkumham}>
            <Input
              value={formData.legal?.skKemenkumham || ""}
              onChange={(e) =>
                onFieldChange("legal", "skKemenkumham", sanitizeStandardText(e.target.value, 60))
              }
              onBlur={(e) => onFieldChange("legal", "skKemenkumham", e.target.value.trim())}
              placeholder="AHU-xxxx.AH.01.xx"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Nomor pokok wajib pajak (NPWP)" error={errors.npwp}>
            <Input
              value={formData.legal?.npwp || ""}
              onChange={(e) =>
                onFieldChange("legal", "npwp", sanitizeNPWP(e.target.value))
              }
              onBlur={(e) => onFieldChange("legal", "npwp", e.target.value.trim())}
              placeholder="00.000.000.0-000.000"
              inputMode="numeric"
              className="h-10 text-sm font-normal font-mono"
            />
          </FormField>

          <FormField label="Izin operasional dinsos" error={errors.izinIzinSosial}>
            <Input
              value={formData.legal?.izinIzinSosial || ""}
              onChange={(e) =>
                onFieldChange("legal", "izinIzinSosial", sanitizeStandardText(e.target.value, 60))
              }
              onBlur={(e) => onFieldChange("legal", "izinIzinSosial", e.target.value.trim())}
              placeholder="Nomor izin dinas sosial"
              className="h-10 text-sm font-normal"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}


