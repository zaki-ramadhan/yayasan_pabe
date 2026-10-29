"use client";

import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  sanitizeStandardText,
  sanitizeDigitsOnly,
  sanitizeBankAccountName,
} from "@/lib/security";

export function AdminSettingsBankSection({
  bankAccounts = [],
  errors = {},
  onAddBankAccount,
  onRemoveBankAccount,
  onBankAccountChange,
}) {
  return (
    <Card className="shadow-2xs">
      <CardHeader className="p-4 sm:p-5 pb-2.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <CardTitle className="text-base font-medium text-slate-900 leading-tight">
          Rekening bank resmi yayasan
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddBankAccount}
          className="gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-700" />
          <span>Tambah rekening</span>
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3.5 space-y-3">
        {bankAccounts.map((account, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <FormField
              label="Nama bank"
              required
              error={errors[`bankName_${idx}`] || errors[`bankAccount_${idx}`]}
              className="sm:col-span-4 space-y-1"
            >
              <Input
                value={account.bank || ""}
                onChange={(e) =>
                  onBankAccountChange(idx, "bank", sanitizeStandardText(e.target.value, 60))
                }
                onBlur={(e) => onBankAccountChange(idx, "bank", e.target.value.trim())}
                placeholder="Contoh: Bank Syariah Indonesia"
                className="h-9 text-sm font-normal bg-white"
                required
              />
            </FormField>

            <FormField
              label="Nomor rekening"
              required
              error={errors[`bankAcc_${idx}`]}
              className="sm:col-span-4 space-y-1"
            >
              <Input
                value={account.accountNumber || ""}
                onChange={(e) =>
                  onBankAccountChange(idx, "accountNumber", sanitizeDigitsOnly(e.target.value, 25))
                }
                onBlur={(e) => onBankAccountChange(idx, "accountNumber", e.target.value.trim())}
                placeholder="Hanya angka (contoh: 7123456789)"
                inputMode="numeric"
                className="h-9 text-sm font-normal bg-white font-mono"
                required
              />
            </FormField>

            <FormField
              label="Atas nama pemilik rekening"
              required
              error={errors[`bankHolder_${idx}`]}
              className="sm:col-span-3 space-y-1"
            >
              <Input
                value={account.accountName || ""}
                onChange={(e) =>
                  onBankAccountChange(idx, "accountName", sanitizeBankAccountName(e.target.value))
                }
                onBlur={(e) => onBankAccountChange(idx, "accountName", e.target.value.trim())}
                placeholder="Atas nama yayasan"
                className="h-9 text-sm font-normal bg-white"
                required
              />
            </FormField>

            <div className="sm:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onRemoveBankAccount(idx)}
                title="Hapus rekening ini"
                className="h-9 w-9 text-slate-500 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {bankAccounts.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4 italic font-normal">
            Belum ada rekening bank resmi yang ditambahkan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

