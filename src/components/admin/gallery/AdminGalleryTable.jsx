"use client";

import {
  Table,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
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
  } = useAdminGallery({
    initialItems,
    initialPagination,
    initialCategories,
    initialEditId,
  });

  return (
    <div className="space-y-4">
      {/* Standard Table Toolbar */}
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

      {/* Main Table Container */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
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
                  colSpan={5}
                  isFiltered={isFiltered}
                />
              ) : (
                items.map((item) => (
                  <AdminGalleryTableRow
                    key={item.id}
                    item={item}
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

      {/* Delete Confirmation Dialog */}
      <AdminGalleryDeleteDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        item={itemToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
