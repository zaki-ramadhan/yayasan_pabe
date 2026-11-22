"use client";

import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { USER_ROLES } from "@/services/authService";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

export function AdminUserAccessFields({
  formData,
  setFormData,
  errors,
  setErrors,
  canAssignSuperAdmin,
  isEdit,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id="hasLoginAccess"
          checked={formData.hasLoginAccess && formData.role !== USER_ROLES.SUPER_ADMIN}
          onCheckedChange={(checked) => {
            const isChecked = Boolean(checked);
            setFormData((prev) => ({
              ...prev,
              hasLoginAccess: isChecked,
              role: isChecked ? USER_ROLES.ADMIN : USER_ROLES.ADMIN,
              password: isChecked
                ? prev.password || (!isEdit ? "Pabe2026!" : "")
                : "",
            }));
            if (!isChecked) {
              setErrors((prev) => ({
                ...prev,
                email: undefined,
                password: undefined,
              }));
            }
          }}
          className="mt-0.5 cursor-pointer"
        />
        <div className="space-y-0.5 leading-none">
          <label
            htmlFor="hasLoginAccess"
            className="text-sm font-medium text-slate-900 cursor-pointer select-none"
          >
            Beri hak akses admin
          </label>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Mengelola program donasi, rekam penyaluran, artikel, dan operasional harian.
          </p>
        </div>
      </div>

      {canAssignSuperAdmin && (
        <div className="flex items-start gap-3 pt-2.5 border-t border-slate-200/80">
          <Checkbox
            id="isSuperAdminAccess"
            checked={formData.hasLoginAccess && formData.role === USER_ROLES.SUPER_ADMIN}
            onCheckedChange={(checked) => {
              const isChecked = Boolean(checked);
              setFormData((prev) => ({
                ...prev,
                hasLoginAccess: isChecked,
                role: isChecked ? USER_ROLES.SUPER_ADMIN : USER_ROLES.ADMIN,
                password: isChecked
                  ? prev.password || (!isEdit ? "Pabe2026!" : "")
                  : "",
              }));
              if (!isChecked) {
                setErrors((prev) => ({
                  ...prev,
                  email: undefined,
                  password: undefined,
                }));
              }
            }}
            className="mt-0.5 cursor-pointer data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
          />
          <div className="space-y-0.5 leading-none">
            <label
              htmlFor="isSuperAdminAccess"
              className="text-sm font-medium text-slate-900 cursor-pointer select-none flex items-center gap-1.5"
            >
              <span>Beri hak akses Super admin</span>
              <Badge variant="purple">Otoritas penuh</Badge>
            </label>
            <p className="text-sm text-slate-500 font-normal mt-0.5">
              Memiliki kendali penuh atas sistem, termasuk menambah, mengatur akses, dan menghapus pengurus lain.
            </p>
          </div>
        </div>
      )}

      {formData.hasLoginAccess && (
        <div className="pt-3 border-t border-slate-200 space-y-3.5 animate-in fade-in duration-150">
          {!isEdit ? (
            <FormField
              label="Kata sandi awal"
              required
              hint="Kata sandi sementara untuk login pertama kali (minimal 6 karakter)."
              error={errors.password}
            >
              <Input
                type="text"
                required
                minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                maxLength={FIELD_LIMITS.PASSWORD_SIMPLE.max}
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  if (errors.password)
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                }}
                onBlur={() => {
                  const pass = formData.password.trim();
                  setFormData((prev) => ({ ...prev, password: pass }));
                  if (!pass) {
                    setErrors((prev) => ({
                      ...prev,
                      password: "Kata sandi awal wajib diisi.",
                    }));
                  } else if (pass.length < FIELD_LIMITS.PASSWORD_SIMPLE.min) {
                    setErrors((prev) => ({
                      ...prev,
                      password: `Kata sandi awal minimal ${FIELD_LIMITS.PASSWORD_SIMPLE.min} karakter.`,
                    }));
                  }
                }}
                placeholder="Contoh: Pabe2026!"
              />
            </FormField>
          ) : (
            <FormField
              label="Ubah kata sandi (opsional)"
              error={errors.password}
            >
              <Input
                type="text"
                minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                maxLength={FIELD_LIMITS.PASSWORD_SIMPLE.max}
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }));
                  if (errors.password)
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                }}
                onBlur={() => {
                  const pass = formData.password.trim();
                  setFormData((prev) => ({ ...prev, password: pass }));
                  if (pass && pass.length < FIELD_LIMITS.PASSWORD_SIMPLE.min) {
                    setErrors((prev) => ({
                      ...prev,
                      password: `Kata sandi minimal ${FIELD_LIMITS.PASSWORD_SIMPLE.min} karakter jika diisi.`,
                    }));
                  }
                }}
                placeholder="Masukkan kata sandi baru jika ingin mengganti"
              />
            </FormField>
          )}
        </div>
      )}
    </div>
  );
}

