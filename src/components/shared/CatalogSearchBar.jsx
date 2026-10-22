import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/shared/SortDropdown";

/**
 * Shared search + sort control bar for catalog pages.
 */
export function CatalogSearchBar({
  searchQuery,
  sortBy,
  sortOptions,
  onSearch,
  onClear,
  onSort,
  isLoading = false,
  searchPlaceholder = "Cari...",
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
      <div className="w-full sm:max-w-md">
        <Input
          type="text"
          icon={Search}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={onSearch}
          onClear={onClear}
          maxLength={60}
          isLoading={isLoading}
          className="h-10 text-sm bg-white"
        />
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <span className="text-sm text-slate-700 flex items-center gap-1.5 shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
          Urutkan:
        </span>

        <SortDropdown
          options={sortOptions}
          value={sortBy}
          onChange={onSort}
          label="Pilih urutan"
        />
      </div>
    </div>
  );
}
