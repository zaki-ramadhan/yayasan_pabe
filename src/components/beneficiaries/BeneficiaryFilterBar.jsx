import { Search, RotateCcw } from "lucide-react";
import { BENEFICIARY_CATEGORIES } from "@/data/beneficiaries";

export function BeneficiaryFilterBar({
  category,
  onCategoryChange,
  gender,
  onGenderChange,
  searchQuery,
  onSearchChange,
  onReset,
  totalResults,
}) {
  const tabs = [
    { id: BENEFICIARY_CATEGORIES.ALL, label: "Semua Binaan" },
    { id: BENEFICIARY_CATEGORIES.YATIM, label: "Yatim Piatu (98)" },
    { id: BENEFICIARY_CATEGORIES.LANSIA_DHUAFA, label: "Lansia & Dhu'afa (34)" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit">
        {tabs.map((tab) => {
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryChange(tab.id)}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-slate-950 shadow-2xs border border-slate-200/70"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white/50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Search & Gender */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama penerima atau program..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white placeholder:text-slate-700 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={gender}
            aria-label="Pilih filter jenis kelamin"
            onChange={(e) => onGenderChange(e.target.value)}
            className="h-9 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua jenis kelamin</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>

          {(category !== BENEFICIARY_CATEGORIES.ALL ||
            gender !== "ALL" ||
            searchQuery) && (
            <button
              type="button"
              onClick={onReset}
              className="h-9 px-3 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Reset filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <div className="text-xs text-slate-700 ml-auto sm:ml-2 whitespace-nowrap">
            Menampilkan <span className="font-semibold text-slate-900">{totalResults}</span> data
          </div>
        </div>
      </div>
    </div>
  );
}
