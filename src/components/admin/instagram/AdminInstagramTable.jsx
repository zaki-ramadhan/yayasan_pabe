"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
  TableSkeletonRows,
} from "@/components/ui/Table";
import { AdminInstagramTableRow } from "./AdminInstagramTableRow";

export function AdminInstagramTable({
  posts = [],
  pagination = {},
  search = "",
  onSearchChange,
  isLoading = false,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onPageChange,
}) {
  return (
    <div className="space-y-4">
      {/* Action Bar: Search & Create */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari narasi postingan..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Button
          onClick={onCreatePost}
          size="sm"
          className="gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah dokumentasi</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                <TableHead className="w-16">Media</TableHead>
                <TableHead className="min-w-[280px]">Caption & Tautan</TableHead>
                <TableHead className="w-40">Tanggal Kegiatan</TableHead>
                <TableHead className="w-20 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows rows={5} columns={4} />
              ) : posts.length === 0 ? (
                <TableEmptyRow
                  colSpan={4}
                  isFiltered={Boolean(search)}
                  message={
                    search
                      ? `Tidak ditemukan dokumentasi dengan kata kunci "${search}".`
                      : "Belum ada postingan dokumentasi. Klik tombol 'Tambah dokumentasi' untuk memasukkan foto kegiatan pertama."
                  }
                />
              ) : (
                posts.map((post) => (
                  <AdminInstagramTableRow
                    key={post.id}
                    post={post}
                    onEdit={onEditPost}
                    onDelete={onDeletePost}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePaginationFooter
          pagination={pagination}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
