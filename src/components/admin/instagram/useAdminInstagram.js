"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSelection } from "@/hooks/useTableSelection";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";

export function useAdminInstagram({
  initialPosts = [],
  initialPagination = {},
  initialProfile = {},
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [pagination, setPagination] = useState(initialPagination);
  const [savedProfile, setSavedProfile] = useState(null);
  const profile = savedProfile || initialProfile;

  const selection = useTableSelection(posts);

  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isInitialMount = useRef(true);

  const fetchPosts = useCallback(
    async (page = 1, currentSearch = debouncedSearch) => {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "15",
          search: currentSearch,
        });

        const res = await safeFetch(`/api/admin/instagram/posts?${query.toString()}`);
        const json = await res.json();

        if (json.success) {
          setPosts(json.data || []);
          setPagination(json.pagination || {});
        } else {
          toast.error(json.message || "Gagal memuat postingan Instagram.");
        }
      } catch {
        toast.error("Terjadi kendala jaringan saat memuat postingan.");
      }
    },
    [debouncedSearch]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    startTransition(() => {
      fetchPosts(1, debouncedSearch);
    });
  }, [debouncedSearch, fetchPosts]);

  const handleOpenCreatePost = () => {
    setPostToEdit(null);
    setIsPostModalOpen(true);
  };

  const handleOpenEditPost = (post) => {
    setPostToEdit(post);
    setIsPostModalOpen(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    try {
      const res = await safeFetch(`/api/admin/instagram/posts/${postToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Postingan berhasil dihapus.");
        setPostToDelete(null);
        fetchPosts(pagination.page || 1, debouncedSearch);
      } else {
        toast.error(json.message || "Gagal menghapus postingan.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProfile = (newProfile) => {
    setSavedProfile(newProfile);
  };

  const handlePostSaved = () => {
    setIsPostModalOpen(false);
    setPostToEdit(null);
    selection.clearSelection();
    fetchPosts(pagination.page || 1, debouncedSearch);
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);

    try {
      const res = await safeFetch("/api/admin/instagram/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message || `${selection.selectedCount} postingan berhasil dihapus.`);
        selection.clearSelection();
        setIsBulkDeleteModalOpen(false);
        fetchPosts(pagination.page || 1, debouncedSearch);
      } else {
        toast.error(json.message || "Gagal menghapus postingan terpilih.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat menghapus postingan.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return {
    posts,
    pagination,
    profile,
    search,
    setSearch: (val) => {
      selection.clearSelection();
      setSearch(val);
    },
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
    fetchPosts: (page, s) => {
      selection.clearSelection();
      fetchPosts(page, s);
    },
  };
}
