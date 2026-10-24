"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminCareerModal } from "@/components/admin/careers/AdminCareerModal";
import { AdminApplicantDrawer } from "@/components/admin/careers/AdminApplicantDrawer";
import { AdminCareerToolbar } from "@/components/admin/careers/AdminCareerToolbar";
import { AdminCareerTableRow } from "@/components/admin/careers/AdminCareerTableRow";
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
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filterDepartmentOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua Divisi" },
      ...DEPARTMENT_OPTIONS.filter((d) => d !== "Semua Divisi").map((dept) => ({
        value: dept,
        label: dept,
      })),
    ];
  }, []);

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
      const res = await safeFetch("/api/admin/careers?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setVacancies(data.data);
        toast.success("Data lowongan berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data lowongan.");
      }
    } catch {
      toast.error("Gagal menyegarkan data lowongan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <AdminCareerToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        departmentFilter={departmentFilter}
        onDepartmentChange={handleDepartmentChange}
        filterDepartmentOptions={filterDepartmentOptions}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
        isLoading={isLoading}
      />

      {/* Main Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posisi &amp; Kode</TableHead>
              <TableHead className="w-48">Divisi &amp; Sistem</TableHead>
              <TableHead className="w-44">Lokasi</TableHead>
              <TableHead className="w-36">Batas Waktu</TableHead>
              <TableHead className="w-32 text-center">Pelamar</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="text-right w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVacancies && paginatedVacancies.length > 0 ? (
              paginatedVacancies.map((job) => (
                <AdminCareerTableRow
                  key={job.id}
                  job={job}
                  onOpenApplicants={handleOpenApplicants}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === job.id}
                />
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
      </TableContainer>

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
