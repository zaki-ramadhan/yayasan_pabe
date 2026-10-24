"use client";

import * as React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  primaryAction,
  secondaryAction,
  className = "",
  children,
}) {
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
                onChange={(e) => {
                  if (!onSearchChange) return;
                  const val = e.target.value;
                  const dualParam = Object.assign(new String(val), {
                    target: { value: val },
                    currentTarget: { value: val },
                    value: val,
                  });
                  onSearchChange(dualParam);
                }}
                onClear={onClearSearch ? onClearSearch : () => onSearchChange("")}
                isLoading={isLoading}
                className="h-10 text-sm bg-white border-slate-300 focus:border-primary"
              />

            </div>
          )}

          {filters}
          {children}
        </div>

        {/* Right Side: Limit Selector, Refresh Button, Primary CTA */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
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
              className="h-10 w-10 rounded-md border-slate-300 bg-white hover:bg-slate-50 cursor-pointer shrink-0 disabled:opacity-50"
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
              disabled={primaryAction.disabled || isLoading}
              className={cn(
                "h-10 px-4 text-sm font-medium gap-1.5 cursor-pointer shrink-0",
                primaryAction.className
              )}
            >
              {primaryAction.icon ? (
                <primaryAction.icon className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
