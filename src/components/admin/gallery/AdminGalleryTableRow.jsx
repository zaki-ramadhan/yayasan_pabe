"use client";

import Image from "next/image";
import { Video, Play } from "lucide-react";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";
import {
  isVideoUrl,
  isYouTubeUrl,
  getYouTubeThumbnail,
} from "@/lib/galleryGroupHelper";

export function AdminGalleryTableRow({
  item,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  const displayTitle = item.title || "Dokumentasi kegiatan";
  const displayDate = item.activityDate || item.createdAt;
  const isYt = isYouTubeUrl(item.imageUrl);
  const isVid = isVideoUrl(item.imageUrl);

  return (
    <TableRow
      onClick={onToggleSelect ? () => onToggleSelect(item.id) : undefined}
      className={`transition-colors cursor-pointer ${
        isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/70"
      }`}
    >
      {/* Checkbox Seleksi */}
      <TableCell className="w-12 text-center py-2.5 align-middle" onClick={(e) => e.stopPropagation()}>
        {onToggleSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(item.id)}
            aria-label={`Pilih ${displayTitle}`}
          />
        )}
      </TableCell>
      {/* Thumbnail Foto / Video */}
      <TableCell className="w-20 py-2.5 align-middle">
        <div
          className="w-14 h-10 rounded-md bg-slate-900 overflow-hidden relative border border-slate-200 shrink-0 select-none"
        >
          {isYt ? (
            <>
              <Image
                src={getYouTubeThumbnail(item.imageUrl)}
                alt={displayTitle}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized
              />
              <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                <Play className="w-3 h-3 fill-white text-white drop-shadow-xs" />
              </div>
            </>
          ) : isVid ? (
            <>
              <video
                src={item.imageUrl}
                muted
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                <Video className="w-3.5 h-3.5 text-white drop-shadow-xs" />
              </div>
            </>
          ) : (
            <Image
              src={item.imageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="56px"
              unoptimized
            />
          )}
        </div>
      </TableCell>

      {/* Judul & Keterangan */}
      <TableCell className="min-w-[220px] py-2.5 align-middle">
        <div className="space-y-0.5">
          <span
            className="text-sm font-medium text-slate-900 block line-clamp-1 leading-snug"
            title={displayTitle}
          >
            {displayTitle}
          </span>
          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </TableCell>

      {/* Kategori */}
      <TableCell className="w-40 py-2.5 text-center align-middle whitespace-nowrap">
        <Badge variant="secondary" className="max-w-[140px] truncate" title={item.category}>
          {item.category || "Umum"}
        </Badge>
      </TableCell>

      {/* Tanggal Kegiatan */}
      <TableCell className="w-36 py-2.5 text-slate-600 text-sm align-middle whitespace-nowrap">
        {formatDate(displayDate)}
      </TableCell>

      {/* Aksi */}
      <TableCell className="w-24 text-right py-2.5 align-middle whitespace-nowrap pr-4">
        <TableRowActions
          onEdit={() => onEdit && onEdit(item)}
          editTooltip="Edit dokumentasi"
          onDelete={() => onDelete && onDelete(item)}
          deleteTooltip="Hapus dokumentasi"
        />
      </TableCell>
    </TableRow>
  );
}
