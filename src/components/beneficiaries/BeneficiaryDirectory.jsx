"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import { BENEFICIARY_CATEGORIES } from "@/data/beneficiaries";
import { BeneficiaryStatsBar } from "./BeneficiaryStatsBar";
import { BeneficiaryFilterBar } from "./BeneficiaryFilterBar";
import { BeneficiaryTableRow } from "./BeneficiaryTableRow";

export function BeneficiaryDirectory({ initialBeneficiaries = [], stats = {} }) {
  const [category, setCategory] = useState(BENEFICIARY_CATEGORIES.ALL);
  const [gender, setGender] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter Data
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

    // Filter Search
    const q = (searchQuery || "").trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.program.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialBeneficiaries, category, gender, searchQuery]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedItems = filteredData.slice(startIndex, startIndex + pageSize);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setCurrentPage(1);
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setCategory(BENEFICIARY_CATEGORIES.ALL);
    setGender("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-3xl space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Transparansi Data Mustahik
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
            Direktori Penerima Manfaat Binaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Daftar resmi 98 anak yatim piatu dan 34 dhu&apos;afa/lansia binaan Yayasan Payung Berkah di Kecamatan Cakung, Jakarta Timur yang terdaftar dalam berkas legalitas LKS 2026.
          </p>
        </div>

        {/* Stats Bar */}
        <BeneficiaryStatsBar stats={stats} />
      </div>

      {/* Filter & Table Body */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <BeneficiaryFilterBar
          category={category}
          onCategoryChange={handleCategoryChange}
          gender={gender}
          onGenderChange={handleGenderChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onReset={handleReset}
          totalResults={totalItems}
        />

        {/* Responsive Table Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">ID</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">Nama Penerima</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">Kategori</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">Gender</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">Program Utama</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap">Wilayah Binaan</th>
                  <th scope="col" className="px-3.5 py-2.5 whitespace-nowrap text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item, idx) => (
                    <BeneficiaryTableRow
                      key={item.id}
                      item={item}
                      index={startIndex + idx + 1}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <p className="text-sm font-medium text-slate-800">
                          Data tidak ditemukan
                        </p>
                        <p className="text-xs text-slate-700">
                          Tidak ada nama atau program yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                        </p>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 cursor-pointer"
                        >
                          Tampilkan seluruh data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-700">
                Halaman <span className="font-semibold text-slate-900">{safeCurrentPage}</span> dari{" "}
                <span className="font-semibold text-slate-900">{totalPages}</span> ({totalItems} data)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Selanjutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
