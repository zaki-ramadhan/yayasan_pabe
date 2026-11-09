"use client";

import Image from "next/image";
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
      className={`hover:bg-slate-50/70 transition-colors ${
        isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
      }`}
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
        {post.postUrl ? (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-900 hover:text-primary hover:underline line-clamp-2 leading-snug cursor-pointer transition-colors block overflow-hidden"
            aria-label={`Buka postingan di Instagram: ${caption}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {caption}
          </a>
        ) : (
          <p
            className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {caption}
          </p>
        )}
      </TableCell>

      <TableCell className="w-40 py-2.5 align-middle text-center text-sm text-slate-600 whitespace-nowrap tabular-nums">
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
