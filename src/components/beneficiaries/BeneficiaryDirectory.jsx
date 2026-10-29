"use client";

import { useState, useMemo } from "react";
import { BENEFICIARY_CATEGORIES } from "@/data/beneficiaries";
import { BeneficiaryStatsBar } from "./BeneficiaryStatsBar";
import { BeneficiaryTableRow } from "./BeneficiaryTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import {
  Table,
  TableContainer,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
  TableToolbar,
} from "@/components/ui/Table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

export function BeneficiaryDirectory({ initialBeneficiaries = [], stats = {} }) {
  const [category, setCategory] = useState(BENEFICIARY_CATEGORIES.ALL);
  const [gender, setGender] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Debounce search query to prevent laggy keystrokes
  const debouncedSearch = useDebounce(searchQuery.trim().toLowerCase(), 300);

  // Filter Data (aman dari page non-aktif & otomatis reset ke hal 1)
  const filteredData = useMemo(() => {
    let result = [...initialBeneficiaries];

    // Filter Kategori
    if (category !== BENEFICIARY_CATEGORIES.ALL) {
      result = result.filter((item) => item.category === category);
    }

    // Filter Gender
    if (gender !== "ALL") {
      result = result.filter((item) => item.gender === gender);
    }

    // Filter Search dengan query yang telah di-sanitize & di-debounce
    if (debouncedSearch) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch)
      );
    }

    return result;
  }, [initialBeneficiaries, category, gender, debouncedSearch]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedItems = filteredData.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    // Sanitasi: anti-leading space, anti-double space, dan strip karakter berbahaya
    const clean = sanitizeSearchQuery(e.target.value).replace(/^\s+/, "");
    setSearchQuery(clean);
    setCurrentPage(1); // Selalu reset ke halaman pertama saat mengetik
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setCurrentPage(1);
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setCurrentPage(1);
  };

  return (
    <section className="space-y-6">
      {/* Heading: Parent tanpa padding, font-medium, tanpa sub heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
          Daftar Penerima Manfaat Binaan
        </h2>
      </div>

      {/* Stats Bar (Cards bentuk folder putih polos dari admin panel) */}
      <BeneficiaryStatsBar stats={stats} />

      {/* Table Section: Toolbar + Single Full-Width Table + Integrated Pagination */}
      <div className="space-y-3.5">
        <TableToolbar
          search={searchQuery}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          searchPlaceholder="Cari nama penerima manfaat..."
          searchWidth="flex-1 min-w-[200px] max-w-sm"
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-10 w-44 text-sm font-normal bg-white border border-slate-300 shrink-0">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50">
                  <SelectItem value={BENEFICIARY_CATEGORIES.ALL} className="cursor-pointer text-sm font-normal py-2">
                    Semua Kategori
                  </SelectItem>
                  <SelectItem value={BENEFICIARY_CATEGORIES.YATIM} className="cursor-pointer text-sm font-normal py-2">
                    Yatim Piatu {stats?.yatimCount != null ? `(${stats.yatimCount})` : ""}
                  </SelectItem>
                  <SelectItem value={BENEFICIARY_CATEGORIES.LANSIA_DHUAFA} className="cursor-pointer text-sm font-normal py-2">
                    Lansia &amp; Dhu&apos;afa {stats?.lansiaDhuafaCount != null ? `(${stats.lansiaDhuafaCount})` : ""}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Jenis Kelamin Dropdown w-48 sm:w-52 agar teks 'Semua Jenis Kelamin' tidak wrap */}
              <Select value={gender} onValueChange={handleGenderChange}>
                <SelectTrigger className="h-10 w-48 sm:w-52 text-sm font-normal bg-white border border-slate-300 shrink-0 whitespace-nowrap">
                  <SelectValue placeholder="Semua Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 z-50">
                  <SelectItem value="ALL" className="cursor-pointer text-sm font-normal py-2">
                    Semua Jenis Kelamin
                  </SelectItem>
                  <SelectItem value="L" className="cursor-pointer text-sm font-normal py-2">
                    Laki-laki
                  </SelectItem>
                  <SelectItem value="P" className="cursor-pointer text-sm font-normal py-2">
                    Perempuan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* Standard Reusable TableContainer from Admin System (Single Full-Width Table) */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 whitespace-nowrap">No.</TableHead>
                <TableHead className="whitespace-nowrap">Nama Penerima</TableHead>
                <TableHead className="w-40 whitespace-nowrap">Kategori</TableHead>
                <TableHead className="w-36 whitespace-nowrap">Jenis Kelamin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, idx) => (
                  <BeneficiaryTableRow
                    key={item.id}
                    item={item}
                    index={startIndex + idx + 1}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={4}
                  isFiltered={Boolean(searchQuery.trim() || category !== BENEFICIARY_CATEGORIES.ALL || gender !== "ALL")}
                />
              )}
            </TableBody>
          </Table>

          {/* Standard Reusable TablePaginationFooter from Admin System */}
          <TablePaginationFooter
            totalItems={totalItems}
            pageSize={pageSize}
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            alwaysShow={totalPages > 1}
          />
        </TableContainer>
      </div>
    </section>
  );
}
