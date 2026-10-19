"use client";

import { useState, useMemo, useEffect } from "react";
import { CareerHeader } from "@/components/careers/CareerHeader";
import { CareerFilterBar } from "@/components/careers/CareerFilterBar";
import { CareerMasterList } from "@/components/careers/CareerMasterList";
import { CareerDetailPanel } from "@/components/careers/CareerDetailPanel";
import { CAREER_VACANCIES } from "@/data/careers";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";

export default function KarierPage() {
  const [vacancies, setVacancies] = useState(CAREER_VACANCIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Semua Lokasi");
  const [type, setType] = useState("Semua Tipe");
  const [department, setDepartment] = useState("Semua Divisi");

  useEffect(() => {
    fetch("/api/careers")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setVacancies(res.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch vacancies:", err));
  }, []);

  // Debounced search query (300ms) for performance and smooth filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [activeJobId, setActiveJobId] = useState(CAREER_VACANCIES[0]?.id || null);

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
        const matchesDept = job.department.toLowerCase().includes(query);
        const matchesLoc = job.location.toLowerCase().includes(query);
        const matchesOverview = job.overview?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDept && !matchesLoc && !matchesOverview) {
          return false;
        }
      }

      // Location matching
      if (location !== "Semua Lokasi" && job.location !== location) {
        return false;
      }

      // Type matching
      if (type !== "Semua Tipe" && job.type !== type) {
        return false;
      }

      // Department matching
      if (department !== "Semua Divisi" && job.department !== department) {
        return false;
      }

      return true;
    });
  }, [debouncedSearchQuery, location, type, department]);

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
    setDepartment("Semua Divisi");
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
          department={department}
          onDepartmentChange={setDepartment}
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
