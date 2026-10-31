"use client";

import { useState, Fragment } from "react";
import { Folder, FolderOpen, ChevronRight, FileImage } from "lucide-react";
import { formatBytes } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Kartu mandiri rincian berkas per folder penyimpanan Cloudflare R2 (SRP terpisah dari banner kuota).
 *
 * @param {object} props
 * @param {Array<{ folder: string, count: number, bytes: number, files?: Array<{ key: string, name: string, size: number, lastModified: Date }> }>} props.folders
 * @param {boolean} [props.isConfigured=true]
 * @param {Function} [props.onRefresh]
 */
export function StorageFolderBreakdownCard({ folders = [], isConfigured = true, onRefresh }) {
  // Simpan state folder terbuka
  const [expandedFolders, setExpandedFolders] = useState(() => {
    const initial = {};
    folders.forEach((f) => {
      if (f.count > 0) initial[f.folder] = true;
    });
    return initial;
  });

  const toggleFolder = (folderName) => {
    const isCurrentlyExpanded = Boolean(expandedFolders[folderName]);
    const targetFolder = folders.find((f) => f.folder === folderName);

    // Jika folder berpenghuni dibuka namun array files belum dimuat, picu refresh data
    if (!isCurrentlyExpanded && targetFolder?.count > 0 && (!targetFolder.files || targetFolder.files.length === 0)) {
      onRefresh?.();
    }

    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !isCurrentlyExpanded,
    }));
  };

  if (!folders || folders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Header Kartu Rincian Folder */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Folder className="w-4.5 h-4.5 text-amber-500 fill-amber-400 shrink-0" />
          <h3 className="text-sm font-medium text-slate-900 tracking-tight">
            Rincian berkas per folder
          </h3>
        </div>
        <span className="text-xs font-normal text-slate-500">
          {folders.length} folder sistem
        </span>
      </div>

      {/* Tabel Berkas Berjenjang (Accordion) */}
      <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
        <table className="w-full text-left text-sm font-normal">
          <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
            <tr className="text-slate-600 select-none">
              <th scope="col" className="py-2.5 px-3 font-medium text-xs sm:text-sm">
                Nama
              </th>
              <th scope="col" className="py-2.5 px-3 font-medium text-xs sm:text-sm text-right">
                Jumlah berkas
              </th>
              <th scope="col" className="py-2.5 px-3 font-medium text-xs sm:text-sm text-right">
                Ukuran
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {folders.map((item) => {
              const isExpanded = Boolean(expandedFolders[item.folder]);
              const hasFiles = Array.isArray(item.files) && item.files.length > 0;

              return (
                <Fragment key={item.folder}>
                  <tr
                    onClick={() => toggleFolder(item.folder)}
                    className="transition-colors group cursor-pointer hover:bg-slate-50/90 select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleFolder(item.folder);
                      }
                    }}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="p-0.5 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0"
                        >
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 transition-transform duration-150",
                              isExpanded && "rotate-90 text-slate-700"
                            )}
                          />
                        </span>
                        {isExpanded && item.count > 0 ? (
                          <FolderOpen className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                        ) : (
                          <Folder className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                        )}
                        <span className="font-normal text-sm text-slate-900 group-hover:text-primary transition-colors">
                          {item.folder}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-normal text-sm text-slate-600 text-right whitespace-nowrap">
                      {item.count} berkas
                    </td>
                    <td className="py-2.5 px-3 font-normal text-sm text-slate-800 text-right whitespace-nowrap">
                      {formatBytes(item.bytes)}
                    </td>
                  </tr>

                  {/* Baris File Di Dalam Folder (Hanya Muncul Jika Berkas > 0) */}
                  {isExpanded && item.count > 0 && (
                    hasFiles ? (
                      item.files.map((file) => (
                        <tr
                          key={file.key}
                          className="bg-slate-50/50 hover:bg-slate-100/70 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <td className="py-1.5 px-3 pl-9 sm:pl-10">
                            <div className="flex items-center gap-2">
                              <FileImage className="w-4 h-4 text-slate-400 shrink-0" />
                              {file.url ? (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-normal text-xs text-slate-700 hover:text-primary hover:underline truncate max-w-[200px] sm:max-w-xs md:max-w-sm" aria-label={`Buka ${file.name || file.key}`}
                                >
                                  {file.name || file.key}
                                </a>
                              ) : (
                                <span
                                  className="font-normal text-xs text-slate-700 truncate max-w-[200px] sm:max-w-xs md:max-w-sm"
                                >
                                  {file.name || file.key}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-1.5 px-3 font-normal text-xs text-slate-500 text-right whitespace-nowrap">
                            1 berkas
                          </td>
                          <td className="py-1.5 px-3 font-normal text-xs text-slate-600 text-right whitespace-nowrap">
                            {formatBytes(file.size)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-slate-50/30">
                        <td colSpan={3} className="py-2 px-3 pl-9 sm:pl-10 text-xs text-slate-500 font-normal">
                          Memuat rincian {item.count} berkas...
                        </td>
                      </tr>
                    )
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isConfigured && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-normal text-amber-800">
          Layanan penyimpanan cloud belum dikonfigurasi pada server.
        </div>
      )}
    </div>
  );
}
