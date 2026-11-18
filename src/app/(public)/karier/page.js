"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { CareerHeader } from "@/components/careers/CareerHeader";
import { CareerFilterBar } from "@/components/careers/CareerFilterBar";
import { CareerMasterList } from "@/components/careers/CareerMasterList";
import { CareerDetailPanel } from "@/components/careers/CareerDetailPanel";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { RestartIcon as RotateCcw } from "@solar-icons/react/line-duotone/restart";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";

export default function KarierPage() {
  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [location, setLocation] = useState("Semua Lokasi");
  const [type, setType] = useState("Semua Tipe");

  const fetchVacancies = () => {
    setIsLoading(true);
    setError(null);
    safeFetch("/api/careers", { timeoutMs: 8000 })
      .then((res) => {
        if (!res.ok) throw new Error(`Server merespons status ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setVacancies(res.data);
          if (res.data.length > 0) {
            setActiveJobId((prev) => prev || res.data[0].id);
          }
        } else {
          throw new Error(res.message || "Gagal memuat lowongan kerja.");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch vacancies:", err);
        setError("Gagal memuat lowongan. Periksa koneksi internet Anda dan coba lagi.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleSearchChange = (rawQuery) => {
    const sanitized = sanitizeSearchQuery(rawQuery);
    setSearchQuery(sanitized);
  };

  const filteredJobs = useMemo(() => {
    return vacancies.filter((job) => {

      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesLoc = job.location.toLowerCase().includes(query);
        const matchesOverview = job.overview?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesOverview) {
          return false;
        }
      }

      if (location !== "Semua Lokasi" && job.location !== location) {
        return false;
      }

      if (type !== "Semua Tipe" && job.type !== type && !job.type.startsWith(type)) {
        return false;
      }

      return true;
    });
  }, [vacancies, debouncedSearchQuery, location, type]);

  const activeJob = useMemo(() => {
    if (filteredJobs.length === 0) return null;
    const found = filteredJobs.find((j) => j.id === activeJobId);
    return found || filteredJobs[0];
  }, [filteredJobs, activeJobId]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setLocation("Semua Lokasi");
    setType("Semua Tipe");
  };

  return (
    <div className="w-full">
      <CareerHeader
        title="Peluang Karier "
        description="Kami membuka peluang bagi individu yang berdedikasi untuk bergabung bersama kami dalam mewujudkan misi kemanusiaan dan pemberdayaan. Di halaman ini, Anda dapat menemukan informasi mengenai lowongan pekerjaan, proses rekrutmen, serta nilai-nilai yang kami pegang dalam bekerja bersama masyarakat."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-5">
        <CareerFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          location={location}
          onLocationChange={setLocation}
          type={type}
          onTypeChange={setType}
        />

        {isLoading ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            <div className="lg:col-span-5 space-y-3">
              <CareerMasterList
                jobs={[]}
                totalVacancies={0}
                activeJobId={null}
                onSelectJob={setActiveJobId}
                onResetFilter={handleResetFilters}
                isLoading={true}
                error={null}
                onRetry={fetchVacancies}
              />
            </div>
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <CareerDetailPanel job={null} isLoading={true} />
            </div>
          </section>
        ) : error ? (
          <div className="w-full">
            <EmptyState
              variant="dashed"
              title="Gagal memuat daftar posisi"
              description={error}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchVacancies}
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba lagi</span>
                </Button>
              }
              className="py-12 sm:py-16"
            />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="w-full">
            <EmptyState
              variant="dashed"
              title={vacancies.length === 0 ? "Belum ada lowongan" : "Posisi tidak ditemukan"}
              description={
                vacancies.length === 0
                  ? "Saat ini belum ada lowongan yang dibuka. Cek kembali secara berkala untuk posisi terbaru."
                  : "Coba ubah kata kunci atau filter pencarian Anda."
              }
              action={
                vacancies.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-sm font-medium"
                  >
                    Reset Semua Filter
                  </Button>
                )
              }
              className="py-12 sm:py-16"
            />
          </div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            <div className="lg:col-span-5 space-y-3">
              <CareerMasterList
                jobs={filteredJobs}
                totalVacancies={vacancies.length}
                activeJobId={activeJob?.id || null}
                onSelectJob={setActiveJobId}
                onResetFilter={handleResetFilters}
                isLoading={false}
                error={null}
                onRetry={fetchVacancies}
              />
            </div>

            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <CareerDetailPanel
                job={activeJob}
                hasVacancies={true}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
