"use client";

import { useState, useMemo } from "react";
import { TrashBinTrashIcon as Trash2 } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { CheckCircleIcon as CheckCircle2 } from "@solar-icons/react/line-duotone/check-circle";
import { CloseCircleIcon as XCircle } from "@solar-icons/react/line-duotone/close-circle";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import { ArchiveIcon as FileArchive } from "@solar-icons/react/line-duotone/archive";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { AdminVolunteerDetailDialog } from "./AdminVolunteerDetailDialog";
import { AdminVolunteerToolbar } from "./AdminVolunteerToolbar";
import { AdminVolunteerTableRow } from "./AdminVolunteerTableRow";
import { AdminVolunteerTableSkeletonRows } from "./AdminVolunteerSkeleton";
import { VolunteerPrintDialog } from "@/components/volunteer/VolunteerPrintDialog";
import { AdminVolunteerBulkDownloadDialog } from "./AdminVolunteerBulkDownloadDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { useAdminLiveEvent } from "@/hooks/useAdminLiveFeed";

const PAGE_SIZE = 10;

export function AdminVolunteerTable({ initialVolunteers = [] }) {
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [statusChangeToConfirm, setStatusChangeToConfirm] = useState(null);
  const [updatingVolunteerId, setUpdatingVolunteerId] = useState(null);
  const [cardVolunteer, setCardVolunteer] = useState(null);
  const [isBulkDownloadOpen, setIsBulkDownloadOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkStatusUpdating, setIsBulkStatusUpdating] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [bulkStatusToConfirm, setBulkStatusToConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Live SSE: Menyisipkan pendaftar relawan baru secara instan tanpa reload browser
  useAdminLiveEvent("VOLUNTEER_CHECKIN", (payload) => {
    if (!payload?.id) return;
    setVolunteers((prev) => {
      if (prev.some((v) => v.id === payload.id)) return prev;
      const newVolunteer = {
        id: payload.id,
        fullName: payload.fullName || payload.name || "Relawan Baru",
        email: payload.email || "",
        phone: payload.phone || "",
        city: payload.city || "-",
        interest: payload.interest || "Anggota",
        motivation: payload.motivation || "",
        status: payload.status || "PENDING",
        createdAt: payload.timestamp || new Date().toISOString(),
      };
      return [newVolunteer, ...prev];
    });
    toast.info(`Pendaftar relawan baru dari ${payload.city || "Kota"} masuk: ${payload.fullName || payload.name}`);
  });

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchName = (v.fullName || "").toLowerCase().includes(q);
        const matchEmail = (v.email || "").toLowerCase().includes(q);
        const matchCity = (v.city || "").toLowerCase().includes(q);
        const matchInterest = (v.interest || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCity && !matchInterest) return false;
      }
      return true;
    });
  }, [volunteers, statusFilter, debouncedSearch]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedVolunteers,
    resetPage,
  } = usePagination(filtered, { pageSize: PAGE_SIZE });

  const selection = useTableSelection(paginatedVolunteers);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    selection.clearSelection();
    resetPage();
  };

  const handleClearSearch = () => {
    setSearch("");
    selection.clearSelection();
    resetPage();
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    selection.clearSelection();
    resetPage();
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/volunteers?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setVolunteers(data.data);
        selection.clearSelection();
        toast.success("Data pendaftar relawan berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data relawan.");
      }
    } catch {
      toast.error("Gagal menyegarkan data relawan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteStatusChange = async (id, newStatus) => {
    setUpdatingVolunteerId(id);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const label =
          newStatus === "APPROVED"
            ? "Disetujui"
            : newStatus === "REJECTED"
            ? "Ditolak"
            : "Menunggu";
        toast.success(`Status relawan berhasil diubah menjadi ${label}.`);
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        if (selectedVolunteer && selectedVolunteer.id === id) {
          setSelectedVolunteer((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error(data.message || "Gagal mengubah status relawan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setUpdatingVolunteerId(null);
    }
  };

  const handleInlineStatusChange = (volunteer, targetStatus) => {
    if (!volunteer || volunteer.status === targetStatus) return;

    if (targetStatus === "APPROVED" || targetStatus === "REJECTED") {
      setStatusChangeToConfirm({
        id: volunteer.id,
        name: volunteer.fullName,
        email: volunteer.email,
        targetStatus,
      });
    } else {
      handleExecuteStatusChange(volunteer.id, targetStatus);
    }
  };

  const handleDelete = (id, name) => {
    setVolunteerToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!volunteerToDelete) return;
    const { id } = volunteerToDelete;

    setIsDeleting(true);
    try {
      const res = await safeFetch(`/api/admin/volunteers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Data relawan berhasil dihapus.");
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        if (selectedVolunteer?.id === id) {
          setSelectedVolunteer(null);
        }
        setVolunteerToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus data relawan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} relawan berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setVolunteers((prev) => prev.filter((v) => !selectedSet.has(v.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus relawan terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus relawan.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkUpdateStatus = async (newStatus) => {
    if (selection.selectedCount === 0) return;
    setIsBulkStatusUpdating(true);
    try {
      const res = await safeFetch("/api/admin/volunteers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        const selectedSet = selection.selectedKeys;
        setVolunteers((prev) =>
          prev.map((v) => (selectedSet.has(v.id) ? { ...v, status: newStatus } : v))
        );
        toast.success(
          data.message ||
            `${selection.selectedCount} relawan berhasil diperbarui menjadi ${newStatus}.`
        );
        selection.clearSelection();
      } else {
        toast.error(data.message || "Gagal memperbarui status relawan terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsBulkStatusUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminVolunteerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        isLoading={isLoading}
        onRefresh={refreshList}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={paginatedVolunteers.length}
        label="relawan"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkStatusUpdating}
          onClick={() => setBulkStatusToConfirm("APPROVED")}
          className="bg-white border-slate-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkStatusUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Setujui</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBulkStatusUpdating}
          onClick={() => setBulkStatusToConfirm("REJECTED")}
          className="bg-white border-slate-300 text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-medium h-8 text-xs gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {isBulkStatusUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span>Tolak</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsBulkDownloadOpen(true)}
          className="bg-white border-slate-300 text-slate-800 hover:bg-slate-50 font-medium h-8 text-xs gap-1.5 cursor-pointer"
          title="Unduh kartu relawan yang dipilih dalam format ZIP siap cetak"
        >
          <FileArchive className="w-3.5 h-3.5 text-emerald-600" />
          <span>Unduh kartu (ZIP)</span>
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteOpen(true)}
          className="font-medium h-8 text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    aria-label="Pilih semua relawan di halaman ini"
                  />
                </TableHead>
                <TableHead className="w-60 min-w-[200px] font-medium text-slate-600 text-sm py-2.5">
                  Relawan
                </TableHead>
                <TableHead className="w-40 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Nomor WhatsApp
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Domisili
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[200px]">
                  Bidang minat
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal daftar
                </TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {isLoading ? (
                <AdminVolunteerTableSkeletonRows rows={5} />
              ) : paginatedVolunteers && paginatedVolunteers.length > 0 ? (
                paginatedVolunteers.map((item) => (
                  <AdminVolunteerTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    onViewDetail={setSelectedVolunteer}
                    onStatusChange={handleInlineStatusChange}
                    isUpdatingStatus={updatingVolunteerId === item.id}
                    onPrintCard={setCardVolunteer}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={8}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL")}
                />
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPageChange={(page) => {
              selection.clearSelection();
              setCurrentPage(page);
            }}
          />
        )}
      </TableContainer>

      <AdminVolunteerDetailDialog
        isOpen={Boolean(selectedVolunteer)}
        onClose={() => setSelectedVolunteer(null)}
        volunteer={selectedVolunteer}
        onPrintCard={(v) => {
          setSelectedVolunteer(null);
          setCardVolunteer(v);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(statusChangeToConfirm)}
        onClose={() => setStatusChangeToConfirm(null)}
        onConfirm={async () => {
          if (!statusChangeToConfirm) return;
          const { id, targetStatus } = statusChangeToConfirm;
          setStatusChangeToConfirm(null);
          await handleExecuteStatusChange(id, targetStatus);
        }}
        isLoading={updatingVolunteerId === statusChangeToConfirm?.id}
        title={
          statusChangeToConfirm?.targetStatus === "APPROVED"
            ? "Setujui pendaftaran relawan?"
            : "Tolak pendaftaran relawan?"
        }
        description={
          statusChangeToConfirm?.targetStatus === "APPROVED" ? (
            <>
              Setujui pendaftaran{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.name}
              </strong>
              ?{" "}
              <strong className="text-emerald-700 font-semibold">
                Kartu relawan resmi akan langsung aktif
              </strong>{" "}
              dan email pemberitahuan otomatis dikirimkan ke{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.email || "email relawan"}
              </strong>
              .
            </>
          ) : (
            <>
              Tandai berkas{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.name}
              </strong>{" "}
              <strong className="text-slate-900 font-semibold">
                belum dapat diterima
              </strong>
              ? Surat pemberitahuan santun akan dikirimkan ke{" "}
              <strong className="text-slate-900 font-semibold">
                {statusChangeToConfirm?.email || "email relawan"}
              </strong>
              .
            </>
          )
        }
        confirmLabel={
          statusChangeToConfirm?.targetStatus === "APPROVED"
            ? "Ya, setujui & aktifkan kartu"
            : "Ya, tolak berkas"
        }
        confirmVariant={
          statusChangeToConfirm?.targetStatus === "APPROVED" ? "default" : "destructive"
        }
        cancelLabel="Batal"
      />

      <VolunteerPrintDialog
        isOpen={Boolean(cardVolunteer)}
        onClose={() => setCardVolunteer(null)}
        volunteer={cardVolunteer}
      />

      <AdminVolunteerBulkDownloadDialog
        isOpen={isBulkDownloadOpen}
        onClose={() => setIsBulkDownloadOpen(false)}
        selectedVolunteers={selection.selectedItems}
        onComplete={() => selection.clearSelection()}
      />

      <ConfirmDialog
        isOpen={Boolean(volunteerToDelete)}
        onClose={() => setVolunteerToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus data relawan"
        description={
          <>
            Hapus berkas pendaftaran relawan atas nama{" "}
            <strong className="text-slate-900 font-semibold">
              &ldquo;{volunteerToDelete?.name}&rdquo;
            </strong>
            ? Tindakan ini{" "}
            <strong className="text-slate-900 font-semibold">
              tidak dapat dibatalkan
            </strong>
            .
          </>
        }
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} data relawan`}
        description={
          <>
            Apakah Anda yakin ingin menghapus{" "}
            <strong className="text-slate-900 font-semibold">
              {selection.selectedCount} data pendaftar relawan terpilih
            </strong>
            ? Tindakan ini{" "}
            <strong className="text-slate-900 font-semibold">
              tidak dapat dibatalkan
            </strong>
            .
          </>
        }
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={Boolean(bulkStatusToConfirm)}
        onClose={() => setBulkStatusToConfirm(null)}
        onConfirm={async () => {
          const targetStatus = bulkStatusToConfirm;
          setBulkStatusToConfirm(null);
          await handleBulkUpdateStatus(targetStatus);
        }}
        isLoading={isBulkStatusUpdating}
        title={
          bulkStatusToConfirm === "APPROVED"
            ? `Setujui ${selection.selectedCount} relawan terpilih?`
            : `Tolak ${selection.selectedCount} relawan terpilih?`
        }
        description={
          bulkStatusToConfirm === "APPROVED" ? (
            <>
              Apakah Anda yakin ingin menyetujui{" "}
              <strong className="text-emerald-700 font-semibold">
                {selection.selectedCount} pendaftar relawan terpilih
              </strong>
              ? Surat resmi tanda anggota akan otomatis dikirimkan ke email
              masing-masing pendaftar.
            </>
          ) : (
            <>
              Apakah Anda yakin ingin menandai{" "}
              <strong className="text-slate-900 font-semibold">
                belum disetujui
              </strong>{" "}
              untuk{" "}
              <strong className="text-slate-900 font-semibold">
                {selection.selectedCount} pendaftar relawan terpilih
              </strong>
              ? Surat pemberitahuan santun akan dikirimkan ke email
              masing-masing pendaftar.
            </>
          )
        }
        confirmLabel={bulkStatusToConfirm === "APPROVED" ? "Ya, setujui semua" : "Ya, tolak semua"}
        confirmVariant={bulkStatusToConfirm === "APPROVED" ? "default" : "destructive"}
        cancelLabel="Batal"
      />
    </div>
  );
}
