"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, RefreshCw } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableEmptyRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUserRoleBadge, AdminUserStatusBadge } from "./AdminUserStatusBadge";
import { AdminUserActionMenu } from "./AdminUserActionMenu";
import { AdminUserModal } from "./AdminUserModal";
import { AdminUserResetDialog } from "./AdminUserResetDialog";
import { AdminUserConfirmDialog } from "./AdminUserConfirmDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatPhoneNumber, MANAGEABLE_ROLES } from "@/lib/userParser";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

export function AdminUserTable({ initialData = { items: [], pagination: {} } }) {
  const { currentUser } = useCurrentUser();

  const [users, setUsers] = useState(initialData?.items || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset password dialog state
  const [resetDialogData, setResetDialogData] = useState(null);

  // Confirm dialog state (suspend/delete)
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null, // "suspend" | "delete"
    targetUser: null,
  });

  const fetchUsers = async ({ newSearch = search, newRole = roleFilter, newStatus = statusFilter, newPage = 1 } = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: newSearch,
        role: newRole,
        status: newStatus,
        page: String(newPage),
        limit: "10",
      });

      const res = await safeFetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setUsers(json.data.items || []);
        setPagination(json.data.pagination || { page: 1, total: 0, totalPages: 1 });
      } else {
        toast.error(json.message || "Gagal memuat data pengurus.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers({ newSearch: search, newPage: 1 });
  };

  const handleRoleChange = (val) => {
    setRoleFilter(val);
    fetchUsers({ newRole: val, newPage: 1 });
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    fetchUsers({ newStatus: val, newPage: 1 });
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Edit existing
        const res = await safeFetch(`/api/admin/users/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Data pengurus berhasil diperbarui.");
          setIsModalOpen(false);
          fetchUsers({ newPage: pagination.page });
        } else {
          toast.error(json.message || "Gagal memperbarui data pengurus.");
        }
      } else {
        // Create new
        const res = await safeFetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          toast.success("Akun pengurus berhasil dibuat.");
          setIsModalOpen(false);
          fetchUsers({ newPage: 1 });

          // Show temporary password if generated
          if (json.data.generatedPassword) {
            setResetDialogData({
              temporaryPassword: json.data.generatedPassword,
              userEmail: json.data.user?.email || formData.email,
              userName: json.data.user?.name || formData.name,
            });
          }
        } else {
          toast.error(json.message || "Gagal mendaftarkan pengurus.");
        }
      }
    } catch {
      toast.error("Terjadi kendala saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await safeFetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResetDialogData(json.data);
      } else {
        toast.error(json.message || "Gagal mereset kata sandi.");
      }
    } catch {
      toast.error("Terjadi kendala saat mereset kata sandi.");
    }
  };

  const handleOpenToggleStatus = (user) => {
    setConfirmState({
      isOpen: true,
      type: "suspend",
      targetUser: user,
    });
  };

  const handleOpenDelete = (user) => {
    setConfirmState({
      isOpen: true,
      type: "delete",
      targetUser: user,
    });
  };

  const handleConfirmAction = async () => {
    const { type, targetUser } = confirmState;
    if (!targetUser) return;

    setIsSubmitting(true);
    try {
      if (type === "suspend") {
        const res = await safeFetch(`/api/admin/users/${targetUser.id}/status`, {
          method: "PATCH",
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message);
          setConfirmState({ isOpen: false, type: null, targetUser: null });
          fetchUsers({ newPage: pagination.page });
        } else {
          toast.error(json.message || "Gagal mengubah status akun.");
        }
      } else if (type === "delete") {
        const res = await safeFetch(`/api/admin/users/${targetUser.id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Akun pengurus berhasil dihapus.");
          setConfirmState({ isOpen: false, type: null, targetUser: null });
          fetchUsers({ newPage: 1 });
        } else {
          toast.error(json.message || "Gagal menghapus akun.");
        }
      }
    } catch {
      toast.error("Terjadi kendala saat memproses tindakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau telepon..."
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-10 w-38 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
              <SelectValue placeholder="Semua peran" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua peran
              </SelectItem>
              {MANAGEABLE_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value} className="cursor-pointer text-sm font-normal py-2">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-10 w-36 text-sm font-normal bg-white border border-slate-300 rounded-lg shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                Semua status
              </SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer text-sm font-normal py-2">
                Aktif
              </SelectItem>
              <SelectItem value="INACTIVE" className="cursor-pointer text-sm font-normal py-2">
                Ditangguhkan
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right Actions: Segarkan + Tambah Pengurus */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchUsers()}
            disabled={isLoading}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-10 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Pengurus baru</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-px py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Foto
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm min-w-[200px]">
                  Pengurus & Email
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Peran
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm min-w-[160px]">
                  Jabatan Struktural
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Kontak
                </TableHead>
                <TableHead className="py-2.5 px-4 font-medium text-slate-600 text-sm whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-px py-2.5 px-4 text-center font-medium text-slate-600 text-sm whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {users && users.length > 0 ? (
                users.map((user) => {
                  const isCurrent = currentUser?.id === user.id;

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Avatar */}
                      <TableCell className="py-3 px-4 w-px align-middle">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-xs font-medium text-slate-600">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(user.name || "P").slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Name & Email */}
                      <TableCell className="py-3 px-4 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-medium text-slate-900 leading-tight">
                              {user.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[11px] font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 block truncate font-normal">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
                        <AdminUserRoleBadge role={user.role} />
                      </TableCell>

                      {/* Structural Title */}
                      <TableCell className="py-3 px-4 align-middle">
                        <span className="text-sm font-normal text-slate-700 block truncate">
                          {user.title || "-"}
                        </span>
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
                        <span className="text-sm font-normal text-slate-700 tabular-nums">
                          {formatPhoneNumber(user.phone)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3 px-4 whitespace-nowrap align-middle">
                        <AdminUserStatusBadge isActive={user.isActive} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3 px-4 text-center whitespace-nowrap align-middle w-px">
                        <AdminUserActionMenu
                          user={user}
                          currentUser={currentUser}
                          onEdit={handleOpenEdit}
                          onResetPassword={handleResetPassword}
                          onToggleStatus={handleOpenToggleStatus}
                          onDelete={handleOpenDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  message="Tidak ada data pengurus yang sesuai kriteria pencarian."
                />
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info & pagination */}
        <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-200/90 flex items-center justify-between text-xs text-slate-500 font-normal">
          <span>Total pengurus terdaftar: {pagination.total || users.length} orang</span>
          <span>Halaman {pagination.page} dari {pagination.totalPages || 1}</span>
        </div>
      </div>

      {/* Dialog Modals */}
      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        user={editingUser}
        isLoading={isSubmitting}
      />

      <AdminUserResetDialog
        isOpen={!!resetDialogData}
        onClose={() => setResetDialogData(null)}
        data={resetDialogData}
      />

      <AdminUserConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, type: null, targetUser: null })}
        onConfirm={handleConfirmAction}
        isLoading={isSubmitting}
        title={
          confirmState.type === "suspend"
            ? confirmState.targetUser?.isActive
              ? "Tangguhkan akun pengurus"
              : "Aktifkan kembali akun"
            : "Hapus akun pengurus"
        }
        description={
          confirmState.type === "suspend"
            ? confirmState.targetUser?.isActive
              ? `Apakah Anda yakin ingin menangguhkan akun ${confirmState.targetUser?.name}? Pengurus ini akan langsung keluar dari sistem dan tidak dapat masuk kembali hingga diaktifkan.`
              : `Apakah Anda yakin ingin mengaktifkan kembali akun ${confirmState.targetUser?.name}?`
            : `Apakah Anda yakin ingin menghapus akun ${confirmState.targetUser?.name} secara permanen dari sistem yayasan? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmLabel={
          confirmState.type === "suspend"
            ? confirmState.targetUser?.isActive
              ? "Tangguhkan sekarang"
              : "Aktifkan akun"
            : "Hapus permanen"
        }
        confirmVariant={confirmState.type === "delete" || confirmState.targetUser?.isActive ? "destructive" : "primary"}
      />
    </div>
  );
}
