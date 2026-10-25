/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/form-dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MANAGEABLE_ROLES } from "@/lib/userParser";
import { USER_ROLES } from "@/services/authService";

export function AdminUserModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  isLoading = false,
}) {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: USER_ROLES.ADMIN,
    title: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || USER_ROLES.ADMIN,
        title: user.title || "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: USER_ROLES.ADMIN,
        title: "",
        password: "",
      });
    }
    setErrorMsg("");
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Alamat email wajib diisi.");
      return;
    }

    setErrorMsg("");
    onSubmit(formData);
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="sm:max-w-lg"
      title={isEdit ? "Ubah data pengurus" : "Tambah pengurus baru"}
      submitText={isEdit ? "Simpan perubahan" : "Tambah pengurus"}
      submittingText="Menyimpan..."
      isSubmitting={isLoading}
      formClassName="space-y-3.5 py-1 text-sm"
    >
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-normal text-rose-700">
          {errorMsg}
        </div>
      )}

      <FormField label="Nama lengkap" required>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Alamat email" required>
          <Input
            type="email"
            required
            disabled={isEdit}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="nama@pabe.or.id"
          />
        </FormField>
        <FormField label="Nomor telepon">
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0812-xxxx-xxxx"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Peran sistem" required>
          <Select
            value={formData.role}
            onValueChange={(val) => setFormData({ ...formData, role: val })}
          >
            <SelectTrigger className="w-full h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg">
              <SelectValue placeholder="Pilih peran" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              {MANAGEABLE_ROLES.map((roleOpt) => (
                <SelectItem
                  key={roleOpt.value}
                  value={roleOpt.value}
                  className="cursor-pointer text-sm font-normal py-2"
                >
                  {roleOpt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Jabatan struktural">
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Staf Verifikasi Kas"
          />
        </FormField>
      </div>

      {!isEdit && (
        <FormField
          label="Kata sandi awal (opsional)"
          hint="Jika dikosongkan, sistem akan otomatis menghasilkan kata sandi sementara yang aman."
        >
          <Input
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Kosongkan untuk generate acak otomatis"
          />
        </FormField>
      )}
    </FormDialog>
  );
}
