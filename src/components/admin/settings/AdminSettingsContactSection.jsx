"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  sanitizeStandardText,
  sanitizeWhatsAppNumber,
  sanitizeLandlinePhone,
  sanitizeEmail,
} from "@/lib/security";

export function AdminSettingsContactSection({ formData, onFieldChange }) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-2.5 border-b border-slate-100">
        <CardTitle className="text-base font-medium text-slate-900 leading-tight">
          Kontak layanan &amp; alamat kantor
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm font-normal">
          <FormField label="Alamat lengkap kantor" className="sm:col-span-2">
            <Input
              value={formData.contacts?.address || ""}
              onChange={(e) =>
                onFieldChange("contacts", "address", sanitizeStandardText(e.target.value, 200))
              }
              onBlur={(e) => onFieldChange("contacts", "address", e.target.value.trim())}
              placeholder="Alamat kantor yayasan"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="WhatsApp resmi layanan">
            <Input
              value={formData.contacts?.whatsapp || ""}
              onChange={(e) =>
                onFieldChange("contacts", "whatsapp", sanitizeWhatsAppNumber(e.target.value))
              }
              onBlur={(e) => onFieldChange("contacts", "whatsapp", e.target.value.trim())}
              placeholder="+62 8xx-xxxx-xxxx"
              inputMode="tel"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Email resmi layanan">
            <Input
              value={formData.contacts?.email || ""}
              onChange={(e) =>
                onFieldChange("contacts", "email", sanitizeEmail(e.target.value))
              }
              onBlur={(e) => onFieldChange("contacts", "email", e.target.value.trim().toLowerCase())}
              placeholder="layanan@yayasangsm.id"
              type="email"
              inputMode="email"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Telepon kantor">
            <Input
              value={formData.contacts?.phone || ""}
              onChange={(e) =>
                onFieldChange("contacts", "phone", sanitizeLandlinePhone(e.target.value))
              }
              onBlur={(e) => onFieldChange("contacts", "phone", e.target.value.trim())}
              placeholder="(021) xxxx-xxxx"
              inputMode="tel"
              className="h-10 text-sm font-normal"
            />
          </FormField>

          <FormField label="Jam pelayanan kantor">
            <Input
              value={formData.contacts?.officeHours || ""}
              onChange={(e) =>
                onFieldChange("contacts", "officeHours", sanitizeStandardText(e.target.value, 80))
              }
              onBlur={(e) => onFieldChange("contacts", "officeHours", e.target.value.trim())}
              placeholder="Senin - Jumat, 08.00 - 17.00 WIB"
              className="h-10 text-sm font-normal"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  );
}


