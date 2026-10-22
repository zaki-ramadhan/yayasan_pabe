"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  user = null, // null for create, object for edit
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              {isEdit ? <UserCog className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <DialogTitle className="text-base font-medium text-slate-900 leading-tight">
                {isEdit ? "Ubah data pengurus" : "Tambah pengurus baru"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                {isEdit
                  ? "Perbarui hak akses dan jabatan struktural pengurus yayasan."
                  : "Daftarkan akun staf baru dan tentukan hak akses peran operasional."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-sm">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-normal text-rose-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd"
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alamat email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                disabled={isEdit}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@pabe.or.id"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812-xxxx-xxxx"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Peran sistem <span className="text-rose-500">*</span>
              </label>
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
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jabatan struktural
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Staf Verifikasi Kas"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kata sandi awal (opsional)
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Kosongkan untuk generate acak otomatis"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-slate-500 block mt-1">
                Jika dikosongkan, sistem akan otomatis menghasilkan kata sandi sementara yang aman.
              </span>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Menyimpan..." : isEdit ? "Simpan perubahan" : "Tambah pengurus"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
