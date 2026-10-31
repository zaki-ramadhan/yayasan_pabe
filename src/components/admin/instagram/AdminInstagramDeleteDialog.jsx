"use client";

import Image from "next/image";
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
          <div className="w-16 h-16 rounded-md bg-slate-200 overflow-hidden relative shrink-0 border border-slate-300">
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.altText || "Postingan"}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No Media
              </div>
            )}
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
