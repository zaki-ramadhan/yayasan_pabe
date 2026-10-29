"use client";

import { Trash2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AdminGalleryToolbar } from "./AdminGalleryToolbar";
import { AdminGalleryTableRow } from "./AdminGalleryTableRow";
import { AdminGalleryModal } from "./AdminGalleryModal";
import { AdminGalleryDeleteDialog } from "./AdminGalleryDeleteDialog";
import { useAdminGallery } from "./useAdminGallery";

export function AdminGalleryTable({
  initialItems = [],
  initialPagination = {},
  initialCategories = [],
  initialEditId,
}) {
  const {
    items,
    pagination,
    categories,
    search,
    category,
    isPending,
    modalOpen,
    setModalOpen,
    selectedItem,
    handleOpenCreate,
    handleOpenEdit,
    itemToDelete,
    setItemToDelete,
    isDeleting,
    isFiltered,
    fetchItems,
    handleRefresh,
    handleSearchChange,
    handleCategoryChange,
    handlePageChange,
    handleDeleteConfirm,
    selection,
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    isBulkDeleting,
    handleConfirmBulkDelete,
  } = useAdminGallery({
    initialItems,
    initialPagination,
    initialCategories,
    initialEditId,
  });

  return (
    <div className="space-y-4">
      <AdminGalleryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        isPending={isPending}
        onRefresh={handleRefresh}
        onOpenUpload={handleOpenCreate}
      />

      {/* Bilah Aksi Massal Reusable */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={items.length}
        label="foto"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteOpen(true)}
          className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus {selection.selectedCount} foto terpilih</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    disabled={items.length === 0}
                    aria-label="Pilih semua foto di halaman ini"
                  />
                </TableHead>
                <TableHead className="w-20 font-medium text-slate-600 text-sm py-2.5">
                  Media
                </TableHead>
                <TableHead className="min-w-[220px] font-medium text-slate-600 text-sm py-2.5">
                  Judul &amp; keterangan
                </TableHead>
                <TableHead className="w-40 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Kategori
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal kegiatan
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <TableEmptyRow
                  colSpan={6}
                  isFiltered={isFiltered}
                />
              ) : (
                items.map((item) => (
                  <AdminGalleryTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
                    onEdit={(it) => handleOpenEdit(it)}
                    onDelete={(it) => setItemToDelete(it)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standard Pagination Footer */}
        <TablePaginationFooter
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </TableContainer>

      {/* Reusable Modal Dialog with FileUploadZone */}
      <AdminGalleryModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        itemToEdit={selectedItem}
        categories={categories}
        onSuccess={() => fetchItems(pagination.page || 1, category, search)}
      />

      {/* Delete Confirmation Dialog Satuan */}
      <AdminGalleryDeleteDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        item={itemToDelete}
        isLoading={isDeleting}
      />

      {/* Delete Confirmation Dialog Massal */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => !isBulkDeleting && setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} dokumentasi kegiatan?`}
        description="Seluruh foto dan video yang dipilih akan dihapus permanen dari basis data dan penyimpanan Cloudflare R2. Tindakan ini tidak dapat dibatalkan."
        confirmLabel={`Hapus ${selection.selectedCount} foto`}
      />
    </div>
  );
}
