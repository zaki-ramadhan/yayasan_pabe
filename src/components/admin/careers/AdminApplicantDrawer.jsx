"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, ExternalLink, FileText, Loader2 } from "lucide-react";
import { maskEmail, maskPhone } from "@/lib/security";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { USER_ROLES } from "@/services/authService";

export function AdminApplicantDrawer({
  isOpen,
  onOpenChange,
  vacancy = null,
}) {
  const { currentUser } = useCurrentUser();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const vacancyId = vacancy?.id;

  const fetchApplications = useCallback(async () => {
    if (!vacancyId) return;
    setIsLoading(true);
    try {
      const res = await safeFetch(`/api/admin/careers/applications?vacancyId=${vacancyId}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch {
      toast.error("Gagal memuat daftar pelamar.");
    } finally {
      setIsLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    let ignore = false;
    if (isOpen && vacancyId) {
      const load = async () => {
        setIsLoading(true);
        try {
          const res = await safeFetch(`/api/admin/careers/applications?vacancyId=${vacancyId}`);
          const data = await res.json();
          if (!ignore && data.success) {
            setApplications(data.data || []);
          }
        } catch {
          if (!ignore) toast.error("Gagal memuat daftar pelamar.");
        } finally {
          if (!ignore) setIsLoading(false);
        }
      };
      load();
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, vacancyId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await safeFetch("/api/admin/careers/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status pelamar berhasil diperbarui.");
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
        );
      } else {
        toast.error(data.message || "Gagal memperbarui status.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950">
            Daftar pelamar: {vacancy?.title || "Lowongan"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-3.5">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">Memuat data pelamar...</div>
          ) : applications.length > 0 ? (
            applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 rounded-full border border-slate-200 shrink-0 bg-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
                          {(app.fullName || "P").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium text-slate-950">
                          {app.fullName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Melamar pada {new Date(app.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status} className="text-xs px-2.5 py-0.5" />

                      <Select
                        value={app.status}
                        onValueChange={(val) => handleStatusChange(app.id, val)}
                        disabled={updatingId === app.id}
                      >
                        <SelectTrigger className="h-8 w-36 text-sm bg-white">
                          <SelectValue placeholder="Ubah Status" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="PENDING">Menunggu</SelectItem>
                          <SelectItem value="REVIEWED">Telah Direview</SelectItem>
                          <SelectItem value="SHORTLISTED">Lolos Seleksi</SelectItem>
                          <SelectItem value="REJECTED">Belum Sesuai</SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingId === app.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Kontak & Tautan */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 font-medium">
                        {maskEmail(app.email)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a href={`tel:${app.phone}`} className="text-slate-800">
                        {maskPhone(app.phone)}
                      </a>
                    </span>
                    {app.resumeUrl && (
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5"
                        >
                          <span>Unduh Resume/CV</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </span>
                    )}
                  </div>

                  {/* Motivasi & Surat Pengantar */}
                  {app.coverLetter && (
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-200/80 text-sm text-slate-700 leading-relaxed">
                      <span className="font-medium text-slate-900 block mb-1">
                        Surat Pengantar &amp; Motivasi:
                      </span>
                      {app.coverLetter}
                    </div>
                  )}
                </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada berkas lamaran yang masuk untuk posisi ini.
            </div>
          )}
        </div>

        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 min-w-[84px] w-full sm:w-auto"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
