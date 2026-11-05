"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormField } from "@/components/ui/FormField";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

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

  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const listRef = React.useRef(null);

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
  const totalItems = filteredOptions.length + (canCreate ? 1 : 0);

  const [prevFilterState, setPrevFilterState] = React.useState({ filteredOptions, canCreate });
  if (filteredOptions !== prevFilterState.filteredOptions || canCreate !== prevFilterState.canCreate) {
    setPrevFilterState({ filteredOptions, canCreate });
    setHighlightedIndex(0);
  }

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

  // Navigasi keyboard (ArrowDown, ArrowUp, Enter, Tab, Escape)
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (totalItems > 0) {
        setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (totalItems > 0) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      }
    } else if (e.key === "Tab") {
      // Shortcut Tab: Langsung pilih opsi yang sedang di-highlight
      if (open && totalItems > 0) {
        if (highlightedIndex < filteredOptions.length && filteredOptions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (highlightedIndex === filteredOptions.length && canCreate) {
          e.preventDefault();
          handleCreate();
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && totalItems > 0) {
        if (highlightedIndex < filteredOptions.length && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (highlightedIndex === filteredOptions.length && canCreate) {
          handleCreate();
        }
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
      if (highlightedIndex < filteredOptions.length && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (highlightedIndex === filteredOptions.length && canCreate) {
        e.preventDefault();
        handleCreate();
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

  const formContext = useFormField();
  const hasError = formContext?.isInvalid || false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onKeyDown={handleTriggerKeyDown}
          data-invalid={hasError ? "true" : undefined}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 text-left",
            hasError
              ? "border-rose-500 bg-rose-50/15 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              : "border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary",
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
        className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-content-available-width)] p-2 z-[60] shadow-xl border border-slate-200 rounded-xl bg-white"
        style={{
          width: "var(--radix-popover-trigger-width)",
          minWidth: "var(--radix-popover-trigger-width)",
        }}
      >
        <div className="space-y-2">
          {/* Search Input with Debounce */}
          <Input
            leftIcon={Search}
            placeholder={searchPlaceholder}
            value={searchTerm}
            minLength={FIELD_LIMITS.COMBOBOX_SEARCH.min}
            maxLength={FIELD_LIMITS.COMBOBOX_SEARCH.max}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onClear={() => setSearchTerm("")}
            className="h-9 text-xs sm:text-sm bg-slate-50 border-slate-200 focus:bg-white"
            autoFocus
          />

          {/* Options List */}
          <div
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5 focus:outline-none"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    tabIndex={-1}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between cursor-pointer",
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : isHighlighted
                        ? "bg-slate-100 text-slate-900"
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
                tabIndex={-1}
                onClick={handleCreate}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                disabled={isCreating}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-md border-t border-slate-100 mt-1 flex items-center gap-2 font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
                  highlightedIndex === filteredOptions.length
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-primary/10 text-primary"
                )}
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
