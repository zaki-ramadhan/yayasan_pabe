"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { useFormField } from "@/components/ui/FormField";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

/**
 * Reusable Read-only Combobox (Searchable Select / Lookup) berbasis Shadcn UI & Radix Popover.
 * Khusus untuk memilih data dari daftar terkurasi dengan pencarian instan (tanpa penambahan data baru).
 *
 * @param {object} props
 * @param {Array<string|object>} props.options - Array of items
 * @param {string} props.value - Nilai item terpilih
 * @param {Function} props.onChange - (selectedValue, fullItem) => void
 * @param {string} [props.placeholder="Pilih opsi..."]
 * @param {string} [props.searchPlaceholder="Cari opsi..."]
 * @param {string} [props.emptyMessage="Tidak ada hasil ditemukan."]
 * @param {number} [props.searchThreshold=5] - Batas minimal jumlah opsi untuk memunculkan input pencarian
 * @param {boolean} [props.alwaysShowSearch=false] - Selalu tampilkan input pencarian tanpa memandang jumlah opsi
 * @param {string} [props.className]
 * @param {string} [props.popoverClassName]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.id]
 * @param {any} [props.error]
 * @param {boolean} [props.isInvalid]
 * @param {Function} [props.renderOption] - Custom renderer untuk tiap baris opsi
 * @param {Function} [props.renderTrigger] - Custom renderer untuk label tombol trigger
 */
export function Combobox({
  options = [],
  value = "",
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari opsi...",
  emptyMessage = "Tidak ada hasil ditemukan.",
  searchThreshold = 5,
  alwaysShowSearch = false,
  className = "",
  popoverClassName = "",
  disabled = false,
  id,
  error,
  isInvalid,
  renderOption,
  renderTrigger,
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const searchInputRef = React.useRef(null);
  const listRef = React.useRef(null);

  const formContext = useFormField();
  const hasError =
    isInvalid !== undefined
      ? Boolean(isInvalid)
      : error !== undefined
      ? Boolean(error)
      : formContext?.isInvalid || false;
  const resolvedId = id || formContext?.id;

  // Normalisasi opsi menjadi bentuk standar: { value, label, category, raw }
  const normalizedOptions = React.useMemo(() => {
    return (options || []).map((item) => {
      if (typeof item === "string") {
        return { value: item, label: item, category: undefined, raw: item };
      }
      const val =
        item.value !== undefined
          ? String(item.value)
          : item.id !== undefined
          ? String(item.id)
          : "";
      const lbl = item.label || item.title || item.name || val;
      const cat = item.category || item.categoryName || undefined;
      return { value: val, label: lbl, category: cat, raw: item };
    });
  }, [options]);

  // Item yang sedang aktif terpilih
  const selectedItem = React.useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === String(value));
  }, [normalizedOptions, value]);

  // Filter opsi berdasarkan kata kunci pencarian (mencari di label & kategori)
  const filteredOptions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchCategory = opt.category ? opt.category.toLowerCase().includes(q) : false;
      return matchLabel || matchCategory;
    });
  }, [normalizedOptions, searchTerm]);

  // Reset indeks highlighted saat hasil filter berubah
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Apakah input pencarian perlu ditampilkan
  const showSearch =
    alwaysShowSearch || normalizedOptions.length >= searchThreshold;

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      setSearchTerm("");
      setHighlightedIndex(0);
      // Auto-focus search input setelah popover terbuka
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  const handleSelect = (item) => {
    onChange?.(item.value, item.raw);
    setOpen(false);
    setSearchTerm("");
  };

  // Navigasi keyboard (ArrowDown, ArrowUp, Enter, Tab, Escape)
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Tab") {
      // Shortcut Tab: Langsung pilih opsi yang sedang di-highlight
      if (open && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (!open) {
        setOpen(true);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        handleKeyDown(e);
      }
    } else if (open && (e.key === "Enter" || e.key === "Tab")) {
      if (filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  // Scroll otomatis ke item yang di-highlight via keyboard
  React.useEffect(() => {
    if (open && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, open]);

  const listboxId = resolvedId ? `combobox-list-${resolvedId}` : "combobox-list";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={resolvedId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "group flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2 text-sm font-normal text-slate-900 transition-colors text-left cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
            hasError
              ? "border-rose-500 bg-rose-50/15 text-rose-950 focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              : "border-slate-300 hover:bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary",
            !selectedItem && (hasError ? "text-rose-400 font-normal" : "text-slate-500 font-normal"),
            className
          )}
        >
          <span className="truncate mr-2">
            {renderTrigger
              ? renderTrigger(selectedItem)
              : selectedItem
              ? selectedItem.category && !selectedItem.label.includes(selectedItem.category)
                ? `${selectedItem.label} (${selectedItem.category})`
                : selectedItem.label
              : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
              hasError ? "text-rose-400" : "text-slate-500"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-content-available-width)] p-1.5 z-50 shadow-lg border border-slate-200 rounded-xl bg-white animate-in fade-in-50 zoom-in-95 duration-150",
          popoverClassName
        )}
        style={
          popoverClassName && (popoverClassName.includes("w-") || popoverClassName.includes("min-w-"))
            ? undefined
            : {
                width: "var(--radix-popover-trigger-width)",
                minWidth: "var(--radix-popover-trigger-width)",
              }
        }
      >
        <div className="space-y-1.5">
          {/* Input Pencarian Filter Lookup */}
          {showSearch && (
            <div className="relative px-1 pt-1 pb-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={
                  open && filteredOptions[highlightedIndex]
                    ? `opt-${resolvedId}-${highlightedIndex}`
                    : undefined
                }
                value={searchTerm}
                minLength={FIELD_LIMITS.COMBOBOX_SEARCH.min}
                maxLength={FIELD_LIMITS.COMBOBOX_SEARCH.max}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full h-8.5 pl-8 pr-7 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-900 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Bersihkan pencarian"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Daftar Opsi Terfilter */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={showSearch ? -1 : 0}
            onKeyDown={!showSearch ? handleKeyDown : undefined}
            className="max-h-64 overflow-y-auto space-y-0.5 p-0.5 focus:outline-none"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    id={`opt-${resolvedId}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-sm font-normal transition-colors flex items-center justify-between cursor-pointer",
                      isSelected
                        ? "bg-blue-50 text-primary"
                        : isHighlighted
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    {renderOption ? (
                      renderOption(opt, isSelected)
                    ) : (
                      <span className="truncate font-normal text-slate-800 pr-2">
                        {opt.label}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
