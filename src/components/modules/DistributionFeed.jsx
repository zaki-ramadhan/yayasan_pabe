"use client";

import { useState, useMemo } from "react";
import { Pagination } from "@/components/ui/pagination";
import { DistributionRecordCard } from "@/components/distribution/DistributionRecordCard";

const ITEMS_PER_PAGE = 4;

export function DistributionFeed({ records = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return records.slice(start, start + ITEMS_PER_PAGE);
  }, [records, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
          Daftar Penyaluran Terakhir
        </h2>
        <span className="text-sm text-slate-700 font-medium">
          Total {records.length} rekam distribusi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedRecords.map((item) => (
          <DistributionRecordCard key={item.id} record={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="pt-6 sm:pt-8"
      />
    </div>
  );
}
