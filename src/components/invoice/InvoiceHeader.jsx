"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NavUserDropdown } from "@/components/nav/NavUserDropdown";
import { logoutUser } from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { ASSET_PATHS } from "@/lib/assetConstants";

export function InvoiceHeader({ initialUser = null }) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const activeUser = currentUser || initialUser;

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (!res?.success) {
        toast.error("Gagal mengakhiri sesi server, sesi lokal telah dibersihkan.");
      }
    } catch {
      toast.error("Terjadi kendala saat keluar.");
    }
    if (typeof window !== "undefined") {
      window.location.replace("/login?loggedOut=true");
    } else {
      router.push("/login?loggedOut=true");
    }
  };

  return (
    <header className="flex items-center justify-between pb-1">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 select-none focus:outline-none group"
        aria-label="Kembali ke Beranda Yayasan Payung Berkah"
      >
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
          <Image
            src={ASSET_PATHS.BRANDING.LOGO}
            alt="Logo Yayasan Payung Berkah"
            width={36}
            height={36}
            priority
            className="object-contain"
          />
        </div>
        <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight group-hover:text-primary transition-colors">
          Yayasan Payung Berkah
        </span>
      </Link>

      <div className="flex items-center">
        <NavUserDropdown currentUser={activeUser} onLogout={handleLogout} />
      </div>
    </header>
  );
}
