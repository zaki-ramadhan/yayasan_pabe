"use client";

import Image from "next/image";
import { Trash2, FileQuestion } from "lucide-react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { usePagination } from "@/hooks/usePagination";
import { formatBytes, formatDate } from "@/lib/formatters";

const PAGE_SIZE = 10;

/**
 * Tabel representasi berkas tak terpakai (Orphan Files) di Cloudflare R2 dengan paginasi.
 */
export function StorageOrphanTable({
  items = [],
  selectedKeys = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSingle,
  onDeleteSelected,
  isScanned = false,
  isScanning = false,
}) {
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  } = usePagination(items, { pageSize: PAGE_SIZE });

  const allSelected = items.length > 0 && selectedKeys.size === items.length;
  const isIndeterminate = selectedKeys.size > 0 && !allSelected;
  const selectedCount = selectedKeys.size;
  const selectedBytes = items
    .filter((item) => selectedKeys.has(item.key))
    .reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <div className="space-y-3">
      {/* Bilah Aksi Massal Terstandarisasi */}
      <TableSelectionBar
        selectedCount={selectedCount}
        totalCount={items.length}
        label="berkas"
        extraInfo={formatBytes(selectedBytes)}
        onSelectAll={() => onToggleSelectAll(true)}
        isAllSelected={allSelected}
        onClearSelection={() => onToggleSelectAll(false)}
      >
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDeleteSelected}
          className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus {selectedCount} berkas terpilih</span>
        </Button>
      </TableSelectionBar>

      {/* Table Container */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={allSelected}
                  indeterminate={isIndeterminate}
                  disabled={items.length === 0}
                  onCheckedChange={(checked) => onToggleSelectAll(checked)}
                  aria-label="Pilih semua berkas"
                />
              </TableHead>
              <TableHead className="w-16">Pratinjau</TableHead>
              <TableHead>Nama Berkas</TableHead>
              <TableHead className="w-28 text-center">Folder</TableHead>
              <TableHead className="w-28 text-right">Ukuran</TableHead>
              <TableHead className="w-40">Waktu Unggah</TableHead>
              <TableHead className="w-20 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isScanning ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Sedang memeriksa berkas sistem...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const isChecked = selectedKeys.has(item.key);
                const filename = item.key.split("/").pop();

                return (
                  <TableRow
                    key={item.key}
                    onClick={() => onToggleSelect(item.key)}
                    className={`cursor-pointer transition-colors ${
                      isChecked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/75"
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggleSelect(item.key)}
                        aria-label={`Pilih ${filename}`}
                      />
                    </TableCell>

                    {/* Thumbnail */}
                    <TableCell>
                      <div className="w-12 h-12 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0">
                        {item.url ? (
                          <Image
                            src={item.url}
                            alt={filename}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FileQuestion className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Nama Berkas */}
                    <TableCell className="max-w-[260px] sm:max-w-xs md:max-w-md">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {filename}
                      </p>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {item.ageHours > 0 ? `Diunggah ${item.ageHours} jam lalu` : item.ageMinutes > 0 ? `Baru diunggah (${item.ageMinutes} mnt lalu)` : "Baru saja diunggah"}
                      </p>
                    </TableCell>

                    {/* Folder Badge */}
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="capitalize text-xs font-normal">
                        {item.folder}
                      </Badge>
                    </TableCell>

                    {/* Ukuran Berkas */}
                    <TableCell className="text-right font-normal text-xs text-slate-800">
                      {formatBytes(item.size)}
                    </TableCell>

                    {/* Waktu Unggah */}
                    <TableCell className="text-xs font-normal text-slate-600">
                      <span>{formatDate(item.lastModified, { withDay: false, withTime: true })}</span>
                    </TableCell>

                    {/* Tombol Hapus Satuan */}
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSingle(item)} aria-label="Hapus berkas ini"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableEmptyRow
                colSpan={7}
                message={
                  isScanned
                    ? "Tidak ada berkas sampah ditemukan. Seluruh berkas terhubung dengan benar."
                    : "Klik 'Pindai berkas tidak terpakai' di atas untuk memeriksa berkas sampah."
                }
              />
            )}
          </TableBody>
        </Table>

        {items.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={items.length}
            limit={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>
    </div>
  );
}
