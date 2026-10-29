"use client";

import { useMemo } from "react";
import { ScanSearch } from "lucide-react";
import { TableToolbar } from "@/components/ui/Table";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

/**
 * Toolbar pencarian, pemfilteran folder via lookup combobox, dan pemicu pemindaian berkas sampah R2.
 */
export function StorageScanToolbar({
  search = "",
  onSearchChange,
  onClearSearch,
  folder = "ALL",
  onFolderChange,
  folders = [],
  age = "0",
  onAgeChange,
  isScanning = false,
  onScan,
}) {
  const folderOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua folder" },
      ...folders.map((f) => ({
        value: f,
        label: f.charAt(0).toUpperCase() + f.slice(1),
      })),
    ];
  }, [folders]);

  return (
    <TableToolbar
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchPlaceholder="Cari nama berkas sampah..."
      searchWidth="flex-1 min-w-[200px] max-w-xs"
      filters={
        <div className="flex flex-wrap items-center gap-2">
          <CreatableCombobox
            options={folderOptions}
            value={folder}
            onChange={onFolderChange}
            placeholder="Semua folder"
            searchPlaceholder="Cari nama folder..."
            emptyMessage="Folder tidak ditemukan."
            className="h-10 w-44 text-sm bg-white shrink-0 border-slate-300"
          />

          {onAgeChange && (
            <Select value={age} onValueChange={onAgeChange}>
              <SelectTrigger className="h-10 w-36 text-sm bg-white shrink-0 border-slate-300">
                <SelectValue placeholder="Semua waktu" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="0">Semua waktu</SelectItem>
                <SelectItem value="1">&gt; 1 jam lalu</SelectItem>
                <SelectItem value="24">&gt; 24 jam lalu</SelectItem>
                <SelectItem value="168">&gt; 7 hari lalu</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      }
      isLoading={isScanning}
      primaryAction={{
        label: isScanning ? "Memindai R2..." : "Pindai berkas tak terpakai",
        onClick: () => onScan(),
        disabled: isScanning,
        isLoading: isScanning,
        icon: ScanSearch,
        className: "font-normal",
      }}
    />
  );
}
