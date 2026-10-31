"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CareerFilterSelect } from "./CareerFilterSelect";
import {
  LOCATION_OPTIONS,
  TYPE_OPTIONS,
} from "@/data/careers";

/**
 * Organism component: Filter and search bar for careers board
 * Utilizes reusable Input and CareerFilterSelect primitives.
 * @param {object} props
 * @param {string} props.searchQuery
 * @param {Function} props.onSearchChange
 * @param {string} props.location
 * @param {Function} props.onLocationChange
 * @param {string} props.type
 * @param {Function} props.onTypeChange
 */
export function CareerFilterBar({
  searchQuery,
  onSearchChange,
  location,
  onLocationChange,
  type,
  onTypeChange,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-4">
      {/* Search Input using reusable UI Input */}
      <Input
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange("")}
        leftIcon={<Search className="w-4.5 h-4.5 text-slate-400" />}
        placeholder="Cari lowongan posisi kerja, lokasi, atau kata kunci..."
        maxLength={80}
        autoComplete="off"
        spellCheck="false"
        className="h-10 text-sm bg-slate-50/70 border-slate-200"
      />

      {/* Filter Selects Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <CareerFilterSelect
          label="Lokasi"
          value={location}
          options={LOCATION_OPTIONS}
          onChange={onLocationChange}
        />
        <CareerFilterSelect
          label="Tipe Komitmen"
          value={type}
          options={TYPE_OPTIONS}
          onChange={onTypeChange}
        />
      </div>
    </div>
  );
}
