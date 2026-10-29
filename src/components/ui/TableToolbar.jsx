"use client";

import * as React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { sanitizeSearchQuery } from "@/lib/sanitizer";

/**
 * Komponen toolbar terstandarisasi untuk seluruh tabel Admin, Superadmin, dan Donor
 */
export function TableToolbar({
  title,
  description,
  search,
  onSearchChange,
  onClearSearch,
  searchPlaceholder = "Cari data...",
  searchWidth = "flex-1 min-w-[200px] max-w-sm",
  filters,
  limit,
  onLimitChange,
  limitOptions = [10, 25, 50],
  onRefresh,
  isLoading = false,
  isSearching = false,
  primaryAction,
  secondaryAction,
  extraActions,
  className = "",
  children,
}) {
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const debounceTimerRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearchChange = (e) => {
    if (!onSearchChange) return;
    const raw = e && e.target ? e.target.value : (e || "");
    const val = sanitizeSearchQuery(raw);
    if (val && String(val).trim().length > 0) {
      setIsDebouncing(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setIsDebouncing(false);
      }, 300);
    } else {
      setIsDebouncing(false);
    }
    const dualParam = Object.assign(new String(val), {
      target: { value: val },
      currentTarget: { value: val },
      value: val,
    });
    onSearchChange(dualParam);
  };

  const handleSearchBlur = () => {
    if (!onSearchChange || typeof search !== "string") return;
    const trimmed = search.trim();
    if (trimmed !== search) {
      const dualParam = Object.assign(new String(trimmed), {
        target: { value: trimmed },
        currentTarget: { value: trimmed },
        value: trimmed,
      });
      onSearchChange(dualParam);
    }
  };

  const handleClear = () => {
    setIsDebouncing(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (onClearSearch) {
      onClearSearch();
    } else if (onSearchChange) {
      onSearchChange("");
    }
  };

  const hasHeaderInfo = Boolean(title || description);

  return (
    <div className={cn("space-y-3", className)}>
      {hasHeaderInfo && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
          <div>
            {title && <h2 className="text-base font-medium text-slate-900">{title}</h2>}
            {description && (
              <p className="text-sm font-normal text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          {secondaryAction && <div>{secondaryAction}</div>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Side: Search & Filter Slots */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {onSearchChange && (
            <div className={searchWidth}>
              <Input
                type="text"
                icon={Search}
                placeholder={searchPlaceholder}
                value={search ?? ""}
                maxLength={80}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onClear={handleClear}
                isLoading={isLoading || isSearching || isDebouncing}
                className="h-10 text-sm bg-white border-slate-300 focus:border-primary"
              />
            </div>
          )}

          {filters}
          {children}
        </div>

        {/* Right Side: Limit Selector, Refresh Button, Primary CTA */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {extraActions}
          {onLimitChange && limit !== undefined && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-sm font-medium text-slate-600">Baris:</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => onLimitChange(Number(val))}
              >
                <SelectTrigger className="w-20 h-10 text-sm rounded-md border-slate-300 bg-white">
                  <SelectValue placeholder={String(limit)} />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-10 w-10 rounded-md border-slate-300 bg-white hover:bg-slate-50 cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              title="Segarkan data tabel"
              aria-label="Segarkan data tabel"
            >
              <RefreshCw className={cn("w-4 h-4 text-slate-600", isLoading && "animate-spin text-primary")} />
            </Button>
          )}

          {primaryAction && (
            <Button
              type="button"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || isLoading || primaryAction.isLoading}
              isLoading={Boolean(isLoading || primaryAction.isLoading)}
              className={cn(
                "h-10 px-4 text-sm font-medium gap-1.5 cursor-pointer shrink-0 disabled:pointer-events-none disabled:cursor-not-allowed",
                primaryAction.className
              )}
            >
              {!isLoading && !primaryAction.isLoading && (
                primaryAction.icon ? (
                  <primaryAction.icon className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )
              )}
              <span>{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
