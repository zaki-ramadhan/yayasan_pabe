"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import { AdminInstagramTableRow } from "./AdminInstagramTableRow";

const MAX_POSTS = 8;

export function AdminInstagramTable({
  posts = [],
  pagination = {},
  totalPosts = 0,
  search = "",
  onSearchChange,
  onClearSearch,
  onRefresh,
  isLoading = false,
  selection,
  onOpenBulkDelete,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onPageChange,
}) {
  const effectiveTotal = pagination?.total !== undefined ? pagination.total : totalPosts || posts.length;
  const isLimitReached = effectiveTotal >= MAX_POSTS;

  return (
    <div className="space-y-4">
      {/* Standardized TableToolbar */}
      <TableToolbar
        search={search}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        searchPlaceholder="Cari narasi postingan..."
        searchWidth="flex-1 min-w-[200px] max-w-sm"
        onRefresh={onRefresh}
        isLoading={isLoading}
        extraActions={
          <span
            className="text-sm font-medium select-none px-1"
            title={
              isLimitReached
                ? "Batas maksimal postingan sudah tercapai, hapus untuk dapat memposting."
                : `Jumlah postingan feed Instagram: ${effectiveTotal}/${MAX_POSTS}`
            }
          >
            <span className="text-slate-900">Postingan : </span>
            <span
              className={cn(
                isLimitReached ? "text-rose-600 font-semibold" : "text-slate-900"
              )}
            >
              {effectiveTotal}/{MAX_POSTS}
            </span>
          </span>
        }
        primaryAction={{
          label: "Tambah postingan",
          onClick: onCreatePost,
          disabled: isLimitReached,
          className: isLimitReached ? "opacity-50 cursor-not-allowed" : "",
          title: isLimitReached
            ? "Batas maksimal postingan sudah tercapai, hapus untuk dapat memposting."
            : undefined,
        }}
      />

      {/* Reusable Floating Bulk Action Bar */}
      {selection && (
        <TableSelectionBar
          selectedCount={selection.selectedCount}
          totalCount={posts.length}
          label="postingan"
          onSelectAll={selection.selectAll}
          isAllSelected={selection.allSelected}
          onClearSelection={selection.clearSelection}
        >
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onOpenBulkDelete}
            className="font-medium h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus {selection.selectedCount} postingan terpilih</span>
          </Button>
        </TableSelectionBar>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Checkbox
                    checked={selection?.allSelected}
                    indeterminate={selection?.isIndeterminate}
                    onCheckedChange={selection?.toggleSelectAll}
                    aria-label="Pilih semua postingan di halaman ini"
                  />
                </TableHead>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead className="min-w-[280px]">Caption & Tautan</TableHead>
                <TableHead className="w-40 text-center">Tanggal Posting</TableHead>
                <TableHead className="w-20 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows
                  rows={8}
                  columns={5}
                  cellAlignments={["center", "left", "left", "center", "right"]}
                />
              ) : posts.length === 0 ? (
                <TableEmptyRow
                  colSpan={5}
                  isFiltered={Boolean(search)}
                  message={
                    search
                      ? `Tidak ditemukan postingan dengan kata kunci "${search}".`
                      : "Belum ada postingan feed Instagram. Klik tombol 'Tambah postingan' untuk menambahkan konten pertama."
                  }
                />
              ) : (
                posts.map((post) => (
                  <AdminInstagramTableRow
                    key={post.id}
                    post={post}
                    isSelected={selection?.isSelected(post.id)}
                    onToggleSelect={selection?.toggleSelect}
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
