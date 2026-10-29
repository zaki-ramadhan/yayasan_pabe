/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { DonorCard } from "@/components/donor/DonorDashboardPrimitives";
import { DonorTrendChartCanvas } from "@/components/donor/DonorTrendChartCanvas";
import { DonorTopCategoryCards } from "@/components/donor/DonorTopCategoryCards";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function DonorMonthlyTrendChart({
  initialMonthlyTrend = [],
  categoryDistribution = [],
  currentUser,
}) {
  const currentDeviceYear = new Date().getFullYear();

  // Dropdown list dinamis 5 tahun terakhir mundur dari waktu perangkat
  const availableYears = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => String(currentDeviceYear - i));
  }, [currentDeviceYear]);

  const [selectedYear, setSelectedYear] = useState(String(currentDeviceYear));
  const [monthlyTrend, setMonthlyTrend] = useState(initialMonthlyTrend);
  const [isYearLoading, setIsYearLoading] = useState(false);

  useEffect(() => {
    if (selectedYear === String(currentDeviceYear) && initialMonthlyTrend?.length > 0) {
      setMonthlyTrend(initialMonthlyTrend);
    }
  }, [initialMonthlyTrend, selectedYear, currentDeviceYear]);

  const handleYearChange = async (newYear) => {
    setSelectedYear(newYear);
    if (!currentUser?.email && !currentUser?.name) return;

    setIsYearLoading(true);
    try {
      const params = new URLSearchParams({
        mode: "trend",
        email: currentUser.email || "",
        name: currentUser.name || "",
        year: newYear,
      });

      const res = await safeFetch(`/api/user/donations?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data?.monthlyTrend) {
        setMonthlyTrend(json.data.monthlyTrend);
      }
    } catch (err) {
      toast({
        title: "Koneksi Bermasalah",
        description: err.message || "Gagal memuat data tren tahunan.",
        variant: "destructive",
      });
    } finally {
      setIsYearLoading(false);
    }
  };

  const isChartEmpty = monthlyTrend.length === 0 || monthlyTrend.every((item) => item.donasi === 0);

  const headerRightElement = (
    <div className="flex items-center gap-2">
      {isYearLoading && (
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      )}
      <Select
        value={selectedYear}
        onValueChange={handleYearChange}
        disabled={isYearLoading}
      >
        <SelectTrigger className="w-24 h-9 text-sm font-normal rounded-md border-slate-300 bg-white">
          <SelectValue placeholder={selectedYear} />
        </SelectTrigger>
        <SelectContent align="end">
          {availableYears.map((yr) => (
            <SelectItem
              key={yr}
              value={yr}
              className="text-sm font-normal cursor-pointer"
            >
              {yr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DonorCard
      title="Riwayat Donasi Bulanan"
      rightElement={headerRightElement}
    >
      <DonorTrendChartCanvas data={monthlyTrend} isChartEmpty={isChartEmpty} />
      <div className="pt-2 border-t border-slate-100">
        <DonorTopCategoryCards categories={categoryDistribution} />
      </div>
    </DonorCard>
  );
}
