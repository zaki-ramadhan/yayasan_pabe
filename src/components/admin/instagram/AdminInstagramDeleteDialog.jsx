"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/formatters";

export function AdminInstagramDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  post = null,
  isLoading = false,
}) {
  if (!post) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Hapus postingan Instagram"
      confirmLabel={isLoading ? "Menghapus..." : "Hapus sekarang"}
      confirmVariant="destructive"
    >
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-2.5 my-2">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-md bg-white overflow-hidden relative shrink-0 border border-slate-300">
            <SafeImage
              src={post.imageUrl}
              alt={post.altText || "Postingan"}
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 line-clamp-2 text-xs">
              {post.caption || "Postingan Instagram"}
            </p>
            <span className="text-xs text-slate-400 block mt-1">
              {formatDate(post.postedAt || post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Postingan akan dihapus permanen dan tidak lagi ditampilkan di situs web.
      </p>
    </ConfirmDialog>
  );
}
