"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AdminPrayerReplyModal({
  prayer,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [replyText, setReplyText] = useState(prayer?.prayerReply || "");

  if (!prayer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSubmit(prayer.id, replyText.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white border border-slate-200 shadow-xl rounded-xl p-5">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <MessageSquare className="w-5 h-5" />
            <DialogTitle className="text-base font-medium text-slate-900">
              Balas doa donatur
            </DialogTitle>
          </div>
          <p className="text-sm font-normal text-slate-500">
            Tanggapan resmi pengurus yayasan atas doa yang dikirimkan oleh{" "}
            <span className="font-medium text-slate-800">{prayer.donorName}</span>.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Kutipan Doa Donatur */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
            <span className="text-xs font-medium text-amber-800 block">
              Doa donatur:
            </span>
            <p className="text-sm font-normal text-slate-800 italic leading-relaxed">
              &ldquo;{prayer.prayer}&rdquo;
            </p>
          </div>

          {/* Input Balasan */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Pesan balasan dari yayasan
            </label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tuliskan respon atau aamiin doa dari pengurus yayasan..."
              rows={4}
              maxLength={300}
              className="w-full text-sm font-normal"
              required
            />
            <span className="text-xs font-normal text-slate-400 block text-right">
              {replyText.length}/300 karakter
            </span>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-normal cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="h-10 px-4 text-sm font-medium gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Kirim balasan"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
