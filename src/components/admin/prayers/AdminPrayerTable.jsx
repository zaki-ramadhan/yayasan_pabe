"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Pin,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/formatters";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminPrayerReplyModal } from "./AdminPrayerReplyModal";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

export function AdminPrayerTable({
  initialData = { prayers: [], total: 0, totalPages: 1, currentPage: 1 },
  campaigns = [],
}) {
  const [prayers, setPrayers] = useState(initialData.prayers || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // State modal balas doa
  const [replyTarget, setReplyTarget] = useState(null);
  const [isReplying, setIsReplying] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 350);
  const isInitialMount = useRef(true);

  const fetchPrayers = async ({
    page = currentPage,
    searchTerm = debouncedSearch,
    status = statusFilter,
    campaign = campaignFilter,
  } = {}) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        search: searchTerm,
        status,
        campaignId: campaign,
      });

      const res = await safeFetch(`/api/admin/prayers?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setPrayers(json.data.prayers || []);
        setTotal(json.data.total || 0);
        setTotalPages(json.data.totalPages || 1);
        setCurrentPage(json.data.currentPage || 1);
      }
    } catch {
      toast.error("Gagal memperbarui daftar doa donatur.");
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, searchTerm: debouncedSearch });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchPrayers({ searchTerm: debouncedSearch });
      toast.success("Daftar doa berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, status: val });
    });
  };

  const handleCampaignFilterChange = (val) => {
    setCampaignFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, campaign: val });
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    startTransition(() => {
      fetchPrayers({ page });
    });
  };

  const handleToggleHide = async (prayer) => {
    const nextHidden = !prayer.isPrayerHidden;
    try {
      const res = await safeFetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: nextHidden ? "HIDE" : "SHOW",
          donationId: prayer.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayer.id ? { ...p, isPrayerHidden: nextHidden } : p
          )
        );
        toast.success(
          nextHidden
            ? "Doa donatur disembunyikan dari feed publik."
            : "Doa donatur kembali ditampilkan ke publik."
        );
      } else {
        toast.error(data.message || "Gagal mengubah visibilitas doa.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memproses moderasi.");
    }
  };

  const handleTogglePin = async (prayer) => {
    const nextPinned = !prayer.isPrayerPinned;
    try {
      const res = await safeFetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: nextPinned ? "PIN" : "UNPIN",
          donationId: prayer.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayer.id ? { ...p, isPrayerPinned: nextPinned } : p
          )
        );
        toast.success(
          nextPinned
            ? "Doa berhasil disematkan di posisi teratas publik."
            : "Sematan doa donatur berhasil dilepas."
        );
      } else {
        toast.error(data.message || "Gagal mengubah sematan doa.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memproses sematan.");
    }
  };

  const handleSaveReply = async ({ donationId, replyText }) => {
    setIsReplying(true);
    try {
      const res = await safeFetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPLY",
          donationId,
          replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Balasan doa resmi pengurus berhasil disimpan.");
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === donationId
              ? {
                  ...p,
                  prayerReply: replyText,
                  prayerReplyAt: new Date().toISOString(),
                }
              : p
          )
        );
        setReplyTarget(null);
      } else {
        toast.error(data.message || "Gagal menyimpan balasan doa.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan balasan.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Control Toolbar (Dropdown mendekat ke Input Search) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Sisi Kiri: Search dan Filter saling mendekat */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Input
              value={search}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              placeholder="Cari donatur, doa, invoice..."
              leftIcon={Search}
              className="h-10 text-sm font-normal bg-white"
            />
          </div>

          {/* Filter Status Moderasi */}
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="h-10 w-38 text-sm font-normal bg-white shrink-0">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua status</SelectItem>
              <SelectItem value="ACTIVE">Ditampilkan</SelectItem>
              <SelectItem value="HIDDEN">Disembunyikan</SelectItem>
              <SelectItem value="REPLIED">Sudah dibalas</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Program Kampanye */}
          {campaigns.length > 0 && (
            <Select value={campaignFilter} onValueChange={handleCampaignFilterChange}>
              <SelectTrigger className="h-10 w-48 text-sm font-normal bg-white shrink-0">
                <SelectValue placeholder="Semua program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua program</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Sisi Kanan: Tombol Refresh mandiri */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            title="Muat ulang data doa"
            className="h-10 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Prayer Table Container (Header selaras dengan halaman donasi rutin, tanpa kolom No.) */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-60 font-medium text-slate-600 text-sm py-2.5">
                  Donatur
                </TableHead>
                <TableHead className="w-48 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Donasi &amp; transaksi
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[180px]">
                  Program kebaikan
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[260px]">
                  Doa &amp; balasan yayasan
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Status moderasi
                </TableHead>
                <TableHead className="w-28 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {prayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-normal text-sm">
                    Belum ada doa donatur yang cocok dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                prayers.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      item.isPrayerPinned
                        ? "bg-amber-50/30"
                        : item.isPrayerHidden
                        ? "bg-slate-50/60 opacity-80"
                        : ""
                    }`}
                  >
                    {/* Donatur */}
                    <TableCell className="w-60 py-3 align-top">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 rounded-full border border-slate-200 shrink-0 bg-slate-100">
                          {item.donorAvatar && <AvatarImage src={item.donorAvatar} alt={item.donorName} />}
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
                            {item.isAnonymous ? "HA" : (item.donorName || "D").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <span className="font-medium text-sm text-slate-900 block leading-tight truncate">
                            {item.donorName}
                          </span>
                          {item.isAnonymous ? (
                            <span className="text-xs font-normal text-slate-400 block">
                              (Anonim)
                            </span>
                          ) : item.donorEmail ? (
                            <span className="text-xs font-normal text-slate-500 block truncate">
                              {item.donorEmail}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    {/* Donasi & Transaksi */}
                    <TableCell className="w-48 py-3 align-top whitespace-nowrap">
                      <div className="flex flex-col text-sm text-slate-500 font-normal space-y-0.5">
                        <span className="font-medium text-slate-800">
                          {formatRupiah(item.amount)}
                        </span>
                        <span className="font-mono text-xs text-slate-500">
                          {item.invoiceId}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(item.createdAt, { withTime: true })}
                        </span>
                      </div>
                    </TableCell>

                    {/* Program Kebaikan */}
                    <TableCell className="text-sm text-slate-800 py-3 align-top">
                      <div className="space-y-1">
                        <span className="font-medium text-sm text-slate-900 block leading-snug">
                          {item.campaignTitle}
                        </span>
                        {item.campaignSlug && (
                          <Link
                            href={`/campaign/${item.campaignSlug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-normal"
                          >
                            <span>Lihat program</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    {/* Isi Doa & Balasan Resmi */}
                    <TableCell className="py-3 align-top space-y-2">
                      <p className="text-sm font-normal text-slate-800 leading-relaxed italic">
                        &ldquo;{item.prayer}&rdquo;
                      </p>

                      {/* Balasan Resmi Pengurus */}
                      {item.prayerReply ? (
                        <div className="p-2.5 rounded-md bg-emerald-50/70 border border-emerald-200/80 text-sm font-normal text-emerald-950 space-y-1">
                          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                            <span>Balasan resmi yayasan</span>
                            {item.prayerReplyAt && (
                              <span className="font-normal text-emerald-700">
                                {formatDate(item.prayerReplyAt, { withTime: true })}
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed not-italic">{item.prayerReply}</p>
                        </div>
                      ) : (
                        <span className="text-sm font-normal text-slate-400 block">
                          Belum ada balasan dari pengurus.
                        </span>
                      )}
                    </TableCell>

                    {/* Status Moderasi */}
                    <TableCell className="w-36 text-center py-3 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        {item.isPrayerPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80 whitespace-nowrap">
                            <Pin className="w-3 h-3 fill-amber-700 text-amber-700" />
                            <span>Disematkan</span>
                          </span>
                        )}

                        {item.isPrayerHidden ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80 whitespace-nowrap">
                            <EyeOff className="w-3 h-3 text-rose-600" />
                            <span>Disembunyikan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 whitespace-nowrap">
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Ditampilkan</span>
                          </span>
                        )}

                        {item.prayerReply && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80 whitespace-nowrap">
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span>Dibalas</span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Aksi Moderasi */}
                    <TableCell className="w-28 text-right py-3 align-top pr-4">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {/* Toggle Sembunyikan */}
                        <button
                          type="button"
                          onClick={() => handleToggleHide(item)}
                          title={item.isPrayerHidden ? "Tampilkan doa ke publik" : "Sembunyikan doa"}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.isPrayerHidden
                              ? "text-rose-600 hover:bg-rose-100/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          {item.isPrayerHidden ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>

                        {/* Toggle Pin */}
                        <button
                          type="button"
                          onClick={() => handleTogglePin(item)}
                          title={item.isPrayerPinned ? "Lepas sematan" : "Sematkan di atas"}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.isPrayerPinned
                              ? "text-amber-700 hover:bg-amber-100/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <Pin
                            className={`w-4 h-4 ${
                              item.isPrayerPinned ? "fill-amber-600" : ""
                            }`}
                          />
                        </button>

                        {/* Balas Doa */}
                        <button
                          type="button"
                          onClick={() => setReplyTarget(item)}
                          title="Beri balasan resmi"
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.prayerReply
                              ? "text-emerald-700 hover:bg-emerald-100/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer pagination terstandarisasi (DRY & reusable) */}
        <TablePaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={15}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modal Balasan Pengurus */}
      <AdminPrayerReplyModal
        prayer={replyTarget}
        isOpen={Boolean(replyTarget)}
        onClose={() => setReplyTarget(null)}
        onSubmit={handleSaveReply}
        isSubmitting={isReplying}
      />
    </div>
  );
}
