"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Reusable Creatable Combobox with Search, Lookup, and Debounce.
 * Replaces static selects with searchable & creatable taxonomy options.
 *
 * @param {object} props
 * @param {Array<string|object>} props.options - Array of string values or { value/id, label/name }
 * @param {string} props.value - Currently selected value/id
 * @param {Function} props.onChange - (selectedValue, fullItem) => void
 * @param {Function} [props.onCreate] - (newTerm) => Promise<newItem> | newItem | string | void
 * @param {string} [props.placeholder="Pilih opsi..."]
 * @param {string} [props.searchPlaceholder="Cari atau ketik baru..."]
 * @param {string} [props.createPrefix="Buat"]
 * @param {string} [props.emptyMessage="Tidak ada hasil ditemukan."]
 * @param {string} [props.className]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 */
export function CreatableCombobox({
  options = [],
  value = "",
  onChange,
  onCreate,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari atau ketik baru...",
  createPrefix = "Buat",
  emptyMessage = "Tidak ada hasil ditemukan.",
  className = "",
  disabled = false,
  required = false,
}) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  // Debounced search term for smooth lookup filtering without stuttering
  const debouncedSearch = useDebounce(searchTerm, 200);

  // Normalize options into consistent shape: { value: string, label: string, raw: any }
  const normalizedOptions = React.useMemo(() => {
    return (options || []).map((item) => {
      if (typeof item === "string") {
        return { value: item, label: item, raw: item };
      }
      const val = item.value !== undefined ? String(item.value) : String(item.id || "");
      const lbl = item.label || item.name || val;
      return { value: val, label: lbl, raw: item };
    });
  }, [options]);

  // Selected item label
  const selectedItem = React.useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === String(value));
  }, [normalizedOptions, value]);

  // Filter options based on debounced search query
  const filteredOptions = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    );
  }, [normalizedOptions, debouncedSearch]);

  const trimmedSearch = debouncedSearch.trim();
  const hasExactMatch = normalizedOptions.some(
    (opt) => opt.label.toLowerCase() === trimmedSearch.toLowerCase()
  );
  const canCreate = Boolean(onCreate) && trimmedSearch.length > 0 && !hasExactMatch;

  const handleSelect = (item) => {
    if (onChange) {
      onChange(item.value, item.raw);
    }
    setOpen(false);
    setSearchTerm("");
  };

  const handleCreate = async () => {
    if (!trimmedSearch || !onCreate || isCreating) return;

    setIsCreating(true);
    try {
      const result = await onCreate(trimmedSearch);
      if (result) {
        if (typeof result === "object") {
          const val = result.value !== undefined ? String(result.value) : String(result.id || "");
          onChange(val, result);
        } else {
          onChange(String(result), result);
        }
      } else {
        onChange(trimmedSearch, trimmedSearch);
      }
      setOpen(false);
      setSearchTerm("");
    } catch (err) {
      console.error("Gagal membuat item baru:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      } else if (canCreate) {
        handleCreate();
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors cursor-pointer focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-left",
            className
          )}
        >
          <span className={cn("block truncate flex-1", !selectedItem && "text-slate-400 font-normal")}>
            {selectedItem ? selectedItem.label : value || placeholder}
          </span>
          <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] min-w-[220px] p-2 z-[60] shadow-xl border border-slate-200 rounded-xl bg-white"
      >
        <div className="space-y-2">
          {/* Search Input with Debounce */}
          <Input
            leftIcon={Search}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onClear={() => setSearchTerm("")}
            className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 focus:bg-white"
            autoFocus
          />

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between cursor-pointer",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-slate-800 hover:bg-slate-100"
                    )}
                  >
                    <span className="truncate mr-2">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })
            ) : !canCreate ? (
              <div className="py-4 text-center text-xs text-slate-500">
                {emptyMessage}
              </div>
            ) : null}

            {/* Creatable Action Bar */}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full text-left px-2.5 py-2 rounded-md hover:bg-primary/10 text-primary border-t border-slate-100 mt-1 flex items-center gap-2 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 shrink-0 text-primary" />
                )}
                <span className="truncate">
                  {createPrefix} &ldquo;{trimmedSearch}&rdquo; baru
                </span>
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
