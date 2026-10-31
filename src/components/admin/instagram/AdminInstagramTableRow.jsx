"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatDate } from "@/lib/formatters";

export function AdminInstagramTableRow({
  post,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  const caption = post.caption || "Tanpa keterangan";
  const postedAtFormatted = post.postedAt
    ? formatDate(post.postedAt, { month: "short", year: "numeric", day: "numeric" })
    : "-";

  return (
    <TableRow
      className="hover:bg-slate-50/70 transition-colors"
      data-state={isSelected ? "selected" : undefined}
    >
      <TableCell className="w-12 text-center py-2.5 px-3 align-middle">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(post.id)}
          aria-label={`Pilih postingan ${caption.slice(0, 30)}`}
        />
      </TableCell>

      <TableCell className="w-16 py-2.5 align-middle">
        <div className="w-12 h-12 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0 select-none">
          {post.imageUrl ? (
            <Image
              src={post.imageUrl}
              alt={post.altText || caption.slice(0, 50)}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
              No Media
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className="min-w-[280px] py-2.5 align-middle">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
            {caption}
          </p>
          {post.postUrl && (
            <div className="flex items-center text-xs text-slate-500">
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline shrink-0"
              >
                <span>Buka postingan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </TableCell>

      <TableCell className="w-40 py-2.5 align-middle text-center text-xs text-slate-600 whitespace-nowrap tabular-nums">
        {postedAtFormatted}
      </TableCell>

      <TableCell className="w-20 py-2.5 align-middle text-right">
        <TableRowActions
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post)}
        />
      </TableCell>
    </TableRow>
  );
}
