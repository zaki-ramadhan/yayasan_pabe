"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Edit3, Trash2, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminCareerModal } from "@/components/admin/careers/AdminCareerModal";
import { AdminApplicantDrawer } from "@/components/admin/careers/AdminApplicantDrawer";
import { DEPARTMENT_OPTIONS } from "@/data/careers";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminCareerTable({ initialVacancies = [] }) {
  const [vacancies, setVacancies] = useState(initialVacancies);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [drawerVacancy, setDrawerVacancy] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((job) => {
      const query = debouncedSearch.toLowerCase();
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);

      const matchesDept =
        departmentFilter === "ALL" ||
        job.department.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [vacancies, debouncedSearch, departmentFilter]);

  const totalPages = Math.ceil(filteredVacancies.length / PAGE_SIZE) || 1;
  const paginatedVacancies = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredVacancies.slice(start, start + PAGE_SIZE);
  }, [filteredVacancies, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleDepartmentChange = (val) => {
    setDepartmentFilter(val);
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedVacancy(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsModalOpen(true);
  };

  const handleOpenApplicants = (vacancy) => {
    setDrawerVacancy(vacancy);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const res = await safeFetch(`/api/admin/careers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status lowongan berhasil diubah menjadi ${nextStatus ? "Aktif" : "Nonaktif"}.`);
        setVacancies((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isActive: nextStatus } : v))
        );
      } else {
        toast.error(data.message || "Gagal mengubah status lowongan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus lowongan "${title}" beserta data pelamarnya?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await safeFetch(`/api/admin/careers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lowongan pekerjaan berhasil dihapus.");
        setVacancies((prev) => prev.filter((v) => v.id !== id));
      } else {
        toast.error(data.message || "Gagal menghapus lowongan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus lowongan.");
    } finally {
      setDeletingId(null);
    }
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/careers");
      const data = await res.json();
      if (data.success && data.data) {
        setVacancies(data.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-w-lg">
          <Input
            leftIcon={Search}
            placeholder="Cari lowongan, divisi, lokasi..."
            value={search}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            className="h-10 text-sm bg-white"
          />

          <Select value={departmentFilter} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="h-10 w-48 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Divisi" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Divisi</SelectItem>
              {DEPARTMENT_OPTIONS.filter((d) => d !== "Semua Divisi").map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 px-3 rounded-lg text-sm font-medium text-slate-700 border-slate-300 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Lowongan Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posisi &amp; Kode</TableHead>
              <TableHead className="w-48">Divisi &amp; Sistem</TableHead>
              <TableHead className="w-44">Lokasi</TableHead>
              <TableHead className="w-36">Batas Waktu</TableHead>
              <TableHead className="w-32 text-center">Pelamar Masuk</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVacancies && paginatedVacancies.length > 0 ? (
              paginatedVacancies.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-slate-900 block">
                        {job.title}
                      </span>
                      <span className="text-sm text-slate-500">
                        {job.jobCode || job.id} &bull; {job.experience}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm font-medium text-slate-800 block">
                        {job.department}
                      </span>
                      <span className="text-sm text-slate-500">
                        {job.type} ({job.workplace})
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-slate-600 py-3">
                    {job.location}
                  </TableCell>

                  <TableCell className="text-sm text-slate-600 py-3 whitespace-nowrap">
                    {job.deadline}
                  </TableCell>

                  <TableCell className="py-3 text-center whitespace-nowrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenApplicants(job)}
                      className="h-8 px-2.5 rounded-md text-sm font-medium text-primary border-primary/30 hover:bg-primary/5 flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{job.applicantCount || 0} Berkas</span>
                    </Button>
                  </TableCell>

                  <TableCell className="py-3 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job.id, job.isActive)}
                      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded border transition-colors cursor-pointer max-w-[120px] truncate whitespace-nowrap align-middle ${
                        job.isActive
                          ? "text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                          : "text-slate-600 bg-slate-100 border-slate-300 hover:bg-slate-200"
                      }`}
                      title="Klik untuk mengubah status aktif lowongan"
                    >
                      {job.isActive ? "Buka (Aktif)" : "Ditutup"}
                    </button>
                  </TableCell>

                  <TableCell className="text-right py-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(job)}
                        title="Sunting lowongan"
                        className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === job.id}
                        onClick={() => handleDelete(job.id, job.title)}
                        title="Hapus lowongan"
                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow
                colSpan={7}
                message={
                  search || departmentFilter !== "ALL"
                    ? "Tidak ada lowongan yang sesuai dengan kriteria filter."
                    : "Belum ada lowongan pekerjaan yang dibuka."
                }
              />
            )}
          </TableBody>
        </Table>

        {filteredVacancies.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredVacancies.length}
            limit={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal & Drawer */}
      <AdminCareerModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        vacancyToEdit={selectedVacancy}
        onSuccess={refreshList}
      />

      <AdminApplicantDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        vacancy={drawerVacancy}
      />
    </div>
  );
}
