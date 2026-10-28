"use client";

import { useAdminStorage } from "./useAdminStorage";
import { StorageCapacityBanner } from "./StorageCapacityBanner";
import { StorageFolderBreakdownCard } from "./StorageFolderBreakdownCard";
import { StorageScanToolbar } from "./StorageScanToolbar";
import { StorageOrphanTable } from "./StorageOrphanTable";
import { StorageDeleteModal } from "./StorageDeleteModal";

/**
 * Komponen orkestrator antarmuka manajemen penyimpanan Cloudflare R2 dan pembersih berkas sampah.
 */
export function AdminStorageManager({ initialOverview = null }) {
  const {
    overview,
    refreshOverview,
    orphans,
    selectedKeys,
    isScanning,
    isScanned,
    search,
    handleSearchChange,
    handleClearSearch,
    folderFilter,
    setFolderFilter,
    ageFilter,
    handleAgeFilterChange,
    availableFolders,
    deleteModalOpen,
    setDeleteModalOpen,
    itemsToDelete,
    isDeleting,
    handleScan,
    handleToggleSelect,
    handleToggleSelectAll,
    handleOpenDeleteSingle,
    handleOpenDeleteSelected,
    handleConfirmDelete,
  } = useAdminStorage({ initialOverview });

  return (
    <div className="space-y-5">
      {/* 1. Banner Status Kapasitas Cloudflare R2 */}
      <StorageCapacityBanner overview={overview} />

      {/* 2. Kartu Rincian Berkas per Folder */}
      <StorageFolderBreakdownCard
        folders={overview?.folders || []}
        isConfigured={overview?.isConfigured ?? true}
        onRefresh={refreshOverview}
      />

      {/* 2. Toolbar Pencarian & Pemicu Pemindaian Sampah */}
      <StorageScanToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        folder={folderFilter}
        onFolderChange={setFolderFilter}
        folders={availableFolders}
        age={ageFilter}
        onAgeChange={handleAgeFilterChange}
        isScanning={isScanning}
        onScan={handleScan}
      />

      {/* 3. Tabel Berkas Sampah (Orphan) */}
      <StorageOrphanTable
        items={orphans}
        selectedKeys={selectedKeys}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onDeleteSingle={handleOpenDeleteSingle}
        onDeleteSelected={handleOpenDeleteSelected}
        isScanned={isScanned}
        isScanning={isScanning}
      />

      {/* 4. Modal Dialog Konfirmasi Penghapusan Destruktif */}
      <StorageDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemsToDelete={itemsToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
