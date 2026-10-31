"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useMemo, useEffect } from "react";
import { CareerHeader } from "@/components/careers/CareerHeader";
import { CareerFilterBar } from "@/components/careers/CareerFilterBar";
import { CareerMasterList } from "@/components/careers/CareerMasterList";
import { CareerDetailPanel } from "@/components/careers/CareerDetailPanel";
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

  // Secure search change handler with validation & sanitization
  const handleSearchChange = (rawQuery) => {
    const sanitized = sanitizeSearchQuery(rawQuery);
    setSearchQuery(sanitized);
  };

  // Filtered vacancies logic with debounced search matching
  const filteredJobs = useMemo(() => {
    return vacancies.filter((job) => {

      // Debounced search matching
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesLoc = job.location.toLowerCase().includes(query);
        const matchesOverview = job.overview?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLoc && !matchesOverview) {
          return false;
        }
      }

      // Location matching
      if (location !== "Semua Lokasi" && job.location !== location) {
        return false;
      }

      // Type matching
      if (type !== "Semua Tipe" && job.type !== type && !job.type.startsWith(type)) {
        return false;
      }

      return true;
    });
  }, [vacancies, debouncedSearchQuery, location, type]);

  // Active job calculation
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
      {/* Full-width Hero Header with texture overlay background */}
      <CareerHeader
        title="Peluang Karier "
        description="Kami membuka peluang bagi individu yang berdedikasi untuk bergabung bersama kami dalam mewujudkan misi kemanusiaan dan pemberdayaan. Di halaman ini, Anda dapat menemukan informasi mengenai lowongan pekerjaan, proses rekrutmen, serta nilai-nilai yang kami pegang dalam bekerja bersama masyarakat."
      />

      {/* Main Content Area bounded to max-w-7xl */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-12 space-y-5">
        {/* Filter & Search Bar with Debounce & Sanitization */}
        <CareerFilterBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          location={location}
          onLocationChange={setLocation}
          type={type}
          onTypeChange={setType}
        />

        {/* Master-Detail Split Grid: Compact gap between left and right columns */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left: Master List */}
          <div className="lg:col-span-5 space-y-3">
            <CareerMasterList
              jobs={filteredJobs}
              activeJobId={activeJob?.id || null}
              onSelectJob={setActiveJobId}
              onResetFilter={handleResetFilters}
              isLoading={isLoading}
              error={error}
              onRetry={fetchVacancies}
            />
          </div>

          {/* Right: Sticky Detail Panel */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <CareerDetailPanel job={activeJob} />
          </div>
        </section>
      </main>
    </div>
  );
}
