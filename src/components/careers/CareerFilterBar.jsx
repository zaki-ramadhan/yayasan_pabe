"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { CareerFilterSelect } from "./CareerFilterSelect";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
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
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      {/* Search Input using reusable UI Input */}
      <div className="flex-1 min-w-0">
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange("")}
          leftIcon={<Search className="w-4.5 h-4.5 text-slate-400" />}
          placeholder="Cari lowongan posisi kerja, lokasi, atau kata kunci..."
          minLength={FIELD_LIMITS.SEARCH_QUERY.min}
          maxLength={FIELD_LIMITS.SEARCH_QUERY.max}
          autoComplete="off"
          spellCheck="false"
          className="h-10 text-sm bg-white border-slate-300 shadow-2xs"
        />
      </div>

      {/* Filter Selects Row */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3 shrink-0">
        <CareerFilterSelect
          label="Lokasi"
          value={location}
          options={LOCATION_OPTIONS}
          onChange={onLocationChange}
          className="w-full sm:w-44 lg:w-48"
        />
        <CareerFilterSelect
          label="Tipe Komitmen"
          value={type}
          options={TYPE_OPTIONS}
          onChange={onTypeChange}
          className="w-full sm:w-48 lg:w-56"
        />
      </div>
    </div>
  );
}
