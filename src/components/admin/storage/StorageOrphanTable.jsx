"use client";

import Image from "next/image";
import { Trash2, FileQuestion, CheckSquare, Square } from "lucide-react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBytes, formatDate } from "@/lib/formatters";

/**
 * Tabel representasi berkas tak terpakai (Orphan Files) di Cloudflare R2.
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
  const allSelected = items.length > 0 && selectedKeys.size === items.length;
  const someSelected = selectedKeys.size > 0;
  const selectedCount = selectedKeys.size;
  const selectedBytes = items
    .filter((item) => selectedKeys.has(item.key))
    .reduce((sum, item) => sum + (item.size || 0), 0);

  return (
    <div className="space-y-3">
      {/* Selection Action Bar (Muncul jika ada item terpilih) */}
      {someSelected && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckSquare className="w-4 h-4 text-primary shrink-0" />
            <span>
              <strong>{selectedCount}</strong> berkas dipilih ({formatBytes(selectedBytes)})
            </span>
          </div>

          <div className="flex items-center gap-2">
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleSelectAll(false)}
              className="h-8 text-xs text-slate-700 hover:text-slate-950 border-slate-300 bg-white cursor-pointer"
            >
              Batal pilih
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={allSelected}
                  disabled={items.length === 0}
                  onCheckedChange={(checked) => onToggleSelectAll(checked)}
                  aria-label="Pilih semua berkas"
                />
              </TableHead>
              <TableHead className="w-16">Pratinjau</TableHead>
              <TableHead>Nama Berkas & Kunci R2</TableHead>
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
                    <span>Sedang memindai dan membandingkan berkas R2 dengan database...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length > 0 ? (
              items.map((item) => {
                const isChecked = selectedKeys.has(item.key);
                const filename = item.key.split("/").pop();

                return (
                  <TableRow
                    key={item.key}
                    className={isChecked ? "bg-primary/5 hover:bg-primary/10 transition-colors" : undefined}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center">
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

                    {/* Nama Berkas & Kunci */}
                    <TableCell className="max-w-[260px] sm:max-w-xs md:max-w-md">
                      <p className="text-sm font-medium text-slate-900 truncate" title={filename}>
                        {filename}
                      </p>
                      <p className="text-sm font-mono text-slate-500 truncate mt-0.5" title={item.key}>
                        {item.key}
                      </p>
                      <span className="inline-block text-xs text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded mt-1 font-normal">
                        {item.ageHours > 0 ? `Diunggah ${item.ageHours} jam lalu` : item.ageMinutes > 0 ? `Baru diunggah (${item.ageMinutes} mnt lalu)` : "Baru saja diunggah"}
                      </span>
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
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSingle(item)}
                        title="Hapus berkas ini"
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
                    ? "Luar biasa! Tidak ada berkas sampah ditemukan. Seluruh berkas di R2 terhubung dengan benar ke database."
                    : "Silakan klik tombol 'Pindai berkas tak terpakai' di atas untuk mencari berkas sampah di Cloudflare R2."
                }
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
