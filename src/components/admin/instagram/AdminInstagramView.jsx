"use client";

import { useAdminInstagram } from "./useAdminInstagram";
import { AdminInstagramAccountCard } from "./AdminInstagramAccountCard";
import { AdminInstagramTable } from "./AdminInstagramTable";
import { AdminInstagramPostModal } from "./AdminInstagramPostModal";
import { AdminInstagramDeleteDialog } from "./AdminInstagramDeleteDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function AdminInstagramView({
  initialPosts = [],
  initialPagination = {},
  initialProfile = {},
}) {
  const {
    posts,
    pagination,
    profile,
    search,
    setSearch,
    selection,
    isPending,
    isPostModalOpen,
    setIsPostModalOpen,
    postToEdit,
    postToDelete,
    setPostToDelete,
    isDeleting,
    isBulkDeleteModalOpen,
    setIsBulkDeleteModalOpen,
    isBulkDeleting,
    handleConfirmBulkDelete,
    handleOpenCreatePost,
    handleOpenEditPost,
    handleDeletePost,
    handleSaveProfile,
    handlePostSaved,
    fetchPosts,
  } = useAdminInstagram({
    initialPosts,
    initialPagination,
    initialProfile,
  });

  return (
    <div className="space-y-6">
      {/* 1. Form Profil Akun Yayasan (Langsung di halaman tanpa modal) */}
      <AdminInstagramAccountCard
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* 2. Daftar Postingan */}
      <AdminInstagramTable
        posts={posts}
        pagination={pagination}
        search={search}
        onSearchChange={setSearch}
        isLoading={isPending}
        selection={selection}
        onOpenBulkDelete={() => setIsBulkDeleteModalOpen(true)}
        onCreatePost={handleOpenCreatePost}
        onEditPost={handleOpenEditPost}
        onDeletePost={setPostToDelete}
        onPageChange={(page) => fetchPosts(page, search)}
      />

      {/* 3. Modal Form Postingan */}
      <AdminInstagramPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        postToEdit={postToEdit}
        onSuccess={handlePostSaved}
      />

      {/* 4. Dialog Konfirmasi Hapus Postingan */}
      <AdminInstagramDeleteDialog
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        post={postToDelete}
        isLoading={isDeleting}
      />

      {/* 5. Dialog Konfirmasi Hapus Massal Postingan */}
      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Postingan Instagram`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} postingan dokumentasi Instagram terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
