"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function useAdminUserManagement({ initialData = { items: [], pagination: {} } }) {
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
    type: null,
    targetUser: null,
  });

  const debouncedSearch = useDebounce(search.trim(), 350);
  const isInitialMount = useRef(true);

  const fetchUsers = async ({
    newSearch = debouncedSearch,
    newRole = roleFilter,
    newStatus = statusFilter,
    newPage = 1,
    isRefresh = false,
  } = {}) => {
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
        if (isRefresh) {
          toast.success("Data pengurus berhasil diperbarui.");
        }
      } else {
        toast.error(json.message || "Gagal memuat data pengurus.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchUsers({ newSearch: debouncedSearch, newPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers({ newSearch: debouncedSearch, newPage: 1 });
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
        const res = await safeFetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Pengurus baru berhasil didaftarkan.");
          setIsModalOpen(false);
          fetchUsers({ newPage: 1 });
        } else {
          toast.error(json.message || "Gagal mendaftarkan pengurus baru.");
        }
      }
    } catch {
      toast.error("Terjadi kendala saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = (user) => {
    setResetDialogData(user);
  };

  const handleResetSubmit = async (newPassword) => {
    if (!resetDialogData) return;
    setIsSubmitting(true);
    try {
      const res = await safeFetch(`/api/admin/users/${resetDialogData.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setResetDialogData(null);
      } else {
        toast.error(json.message || "Gagal mengatur ulang kata sandi.");
      }
    } catch {
      toast.error("Terjadi kendala saat mengatur ulang kata sandi.");
    } finally {
      setIsSubmitting(false);
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

  return {
    currentUser,
    users,
    pagination,
    search,
    setSearch,
    roleFilter,
    statusFilter,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingUser,
    isSubmitting,
    resetDialogData,
    setResetDialogData,
    confirmState,
    setConfirmState,
    fetchUsers,
    handleSearchSubmit,
    handleRoleChange,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleModalSubmit,
    handleResetPassword,
    handleResetSubmit,
    handleOpenToggleStatus,
    handleOpenDelete,
    handleConfirmAction,
  };
}
