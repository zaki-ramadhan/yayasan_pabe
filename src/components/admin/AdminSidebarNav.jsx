"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";

import { Widget2Icon as Widget2Line } from "@solar-icons/react/line-duotone/widget-2";
import { UsersGroupTwoRoundedIcon as UsersGroupTwoRoundedLine } from "@solar-icons/react/line-duotone/users-group-two-rounded";
import { HandHeartIcon as HandHeartLine } from "@solar-icons/react/line-duotone/hand-heart";
import { HandMoneyIcon as HandMoneyLine } from "@solar-icons/react/line-duotone/hand-money";
import { DeliveryIcon as DeliveryLine } from "@solar-icons/react/line-duotone/delivery";
import { CardTransferIcon as CardTransferLine } from "@solar-icons/react/line-duotone/card-transfer";
import { CalendarDateIcon as CalendarDateLine } from "@solar-icons/react/line-duotone/calendar-date";
import { ChatRoundDotsIcon as ChatRoundDotsLine } from "@solar-icons/react/line-duotone/chat-round-dots";
import { DocumentTextIcon as DocumentTextLine } from "@solar-icons/react/line-duotone/document-text";
import { GalleryWideIcon as GalleryWideLine } from "@solar-icons/react/line-duotone/gallery-wide";
import { CameraMinimalisticIcon as CameraMinimalisticLine } from "@solar-icons/react/line-duotone/camera-minimalistic";
import { CaseRoundIcon as CaseRoundLine } from "@solar-icons/react/line-duotone/case-round";
import { HandShakeIcon as HandShakeLine } from "@solar-icons/react/line-duotone/hand-shake";
import { QuestionCircleIcon as QuestionCircleLine } from "@solar-icons/react/line-duotone/question-circle";
import { ShieldUserIcon as ShieldUserLine } from "@solar-icons/react/line-duotone/shield-user";
import { SettingsMinimalisticIcon as SettingsMinimalisticLine } from "@solar-icons/react/line-duotone/settings-minimalistic";
import { ServerPathIcon as ServerPathLine } from "@solar-icons/react/line-duotone/server-path";
import { ShieldKeyholeIcon as ShieldKeyholeLine } from "@solar-icons/react/line-duotone/shield-keyhole";
import { CodeCircleIcon as CodeCircleLine } from "@solar-icons/react/line-duotone/code-circle";

import { Widget2Icon as Widget2Bold } from "@solar-icons/react/bold/widget-2";
import { UsersGroupTwoRoundedIcon as UsersGroupTwoRoundedBold } from "@solar-icons/react/bold/users-group-two-rounded";
import { HandHeartIcon as HandHeartBold } from "@solar-icons/react/bold/hand-heart";
import { HandMoneyIcon as HandMoneyBold } from "@solar-icons/react/bold/hand-money";
import { DeliveryIcon as DeliveryBold } from "@solar-icons/react/bold/delivery";
import { CardTransferIcon as CardTransferBold } from "@solar-icons/react/bold/card-transfer";
import { CalendarDateIcon as CalendarDateBold } from "@solar-icons/react/bold/calendar-date";
import { ChatRoundDotsIcon as ChatRoundDotsBold } from "@solar-icons/react/bold/chat-round-dots";
import { DocumentTextIcon as DocumentTextBold } from "@solar-icons/react/bold/document-text";
import { GalleryWideIcon as GalleryWideBold } from "@solar-icons/react/bold/gallery-wide";
import { CameraMinimalisticIcon as CameraMinimalisticBold } from "@solar-icons/react/bold/camera-minimalistic";
import { CaseRoundIcon as CaseRoundBold } from "@solar-icons/react/bold/case-round";
import { HandShakeIcon as HandShakeBold } from "@solar-icons/react/bold/hand-shake";
import { QuestionCircleIcon as QuestionCircleBold } from "@solar-icons/react/bold/question-circle";
import { ShieldUserIcon as ShieldUserBold } from "@solar-icons/react/bold/shield-user";
import { SettingsMinimalisticIcon as SettingsMinimalisticBold } from "@solar-icons/react/bold/settings-minimalistic";
import { ServerPathIcon as ServerPathBold } from "@solar-icons/react/bold/server-path";
import { ShieldKeyholeIcon as ShieldKeyholeBold } from "@solar-icons/react/bold/shield-keyhole";
import { CodeCircleIcon as CodeCircleBold } from "@solar-icons/react/bold/code-circle";

import { USER_ROLES } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";
import { useStorageAlert } from "@/hooks/useStorageAlert";

const ADMIN_NAV_GROUPS = [
  {
    title: "Program & Donasi",
    items: [
      { href: "/admin", label: "Dashboard Utama", icon: Widget2Line, activeIcon: Widget2Bold, exact: true },
      { href: "/admin/donatur", label: "Daftar Donatur", icon: UsersGroupTwoRoundedLine, activeIcon: UsersGroupTwoRoundedBold },
      { href: "/admin/program", label: "Kelola Program Donasi", icon: HandHeartLine, activeIcon: HandHeartBold },
      { href: "/admin/zis", label: "Kelola Program ZIS", icon: HandMoneyLine, activeIcon: HandMoneyBold },
      { href: "/admin/distribusi", label: "Rekam Penyaluran", icon: DeliveryLine, activeIcon: DeliveryBold },
      { href: "/admin/transaksi", label: "Mutasi Transaksi", icon: CardTransferLine, activeIcon: CardTransferBold },
      { href: "/admin/donasi-rutin", label: "Donasi Rutin", icon: CalendarDateLine, activeIcon: CalendarDateBold },
      { href: "/admin/doa", label: "Moderasi Doa", icon: ChatRoundDotsLine, activeIcon: ChatRoundDotsBold },
    ],
  },
  {
    title: "Konten & Informasi",
    items: [
      { href: "/admin/artikel", label: "Berita & Artikel", icon: DocumentTextLine, activeIcon: DocumentTextBold },
      { href: "/admin/galeri", label: "Galeri Dokumentasi", icon: GalleryWideLine, activeIcon: GalleryWideBold },
      { href: "/admin/instagram", label: "Feed Instagram", icon: CameraMinimalisticLine, activeIcon: CameraMinimalisticBold },
      { href: "/admin/karier", label: "Lowongan Karier", icon: CaseRoundLine, activeIcon: CaseRoundBold },
      { href: "/admin/relawan", label: "Kelola Relawan", icon: HandShakeLine, activeIcon: HandShakeBold },
      { href: "/admin/faq", label: "Pusat FAQ", icon: QuestionCircleLine, activeIcon: QuestionCircleBold },
    ],
  },
];

export function AdminSidebarNav({
  isCollapsed = false,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { health } = useStorageAlert();
  const isSuperAdmin = currentUser?.role === USER_ROLES.SUPER_ADMIN;
  const userEmail = (currentUser?.email || "").toLowerCase().trim();
  const isInfrastructureAdmin =
    isSuperAdmin && isInfrastructureEmail(userEmail);

  const navGroups = [
    ...ADMIN_NAV_GROUPS,
    ...(isSuperAdmin
      ? [
          {
            title: "Hak Akses & Pengurus",
            items: [
              { href: "/admin/pengguna", label: "Kelola Pengurus", icon: ShieldUserLine, activeIcon: ShieldUserBold },
              { href: "/admin/pengaturan", label: "Pengaturan Yayasan", icon: SettingsMinimalisticLine, activeIcon: SettingsMinimalisticBold },
            ],
          },
        ]
      : []),
    ...(isInfrastructureAdmin
      ? [
          {
            title: "Infrastruktur & Sistem",
            items: [
              {
                href: "/admin/penyimpanan",
                label: "Penyimpanan Berkas",
                icon: ServerPathLine,
                activeIcon: ServerPathBold,
              },
              {
                href: "/api/admin/external/google-oauth",
                label: "Console Google OAuth",
                icon: ShieldKeyholeLine,
                activeIcon: ShieldKeyholeBold,
                isExternal: true,
              },
              {
                href: "/api/admin/external/facebook-oauth",
                label: "Meta Developers OAuth",
                icon: CodeCircleLine,
                activeIcon: CodeCircleBold,
                isExternal: true,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-slate-200 select-none overflow-hidden">
      <div className="shrink-0 p-3 pb-3 border-b border-slate-300">
        <Link
          href="/"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center group transition-all",
            isCollapsed ? "justify-center w-full" : "gap-2.5 w-full"
          )}
        >
          <div className="relative w-8.5 h-8.5 rounded-md overflow-hidden bg-white shrink-0 p-0.5 border border-slate-200 flex items-center justify-center">
            <Image
              src="/img/branding/logo-ypabe.webp"
              alt="Logo Yayasan Payung Berkah"
              width={34}
              height={34}
              className="w-full h-full object-contain rounded-xs"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 truncate">
              <span className="font-normal text-sm block text-slate-950 leading-tight truncate">
                Yayasan PABE
              </span>
              <span className="text-sm font-normal text-slate-500 block truncate">
                Panel admin
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scrollbar">
        {navGroups.map((group, index) => {
          return (
            <div key={group.title} className="space-y-0.5">
              {index > 0 && <div className="-mx-3 my-2.5 border-t border-slate-300" />}

              {isCollapsed ? (
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onCloseMobile}
                        title={item.label}
                        className={cn(
                          "flex items-center rounded-md transition-all justify-center p-2 text-xs",
                          isActive
                            ? "text-black bg-slate-200/80 shadow-2xs"
                            : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                        )}
                      >
                        {ItemIcon && <ItemIcon className="w-5 h-5 shrink-0" />}
                      </Link>
                    );
                  })}
                </nav>
              ) : (
                <>
                  <div className="px-3 pt-1 pb-1 select-none">
                    <span className="truncate text-sm font-normal text-slate-900 block">
                      {group.title}
                    </span>
                  </div>

                  <nav className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const ItemIcon = isActive ? (item.activeIcon || item.icon) : item.icon;

                      if (item.isExternal) {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={onCloseMobile}
                            className="flex items-center gap-2.5 rounded-md text-sm transition-all px-3 py-1.5 justify-between text-slate-900 hover:text-black hover:bg-slate-200/50 font-normal group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {ItemIcon && (
                                <ItemIcon className="w-4.5 h-4.5 text-slate-700 group-hover:text-black shrink-0 transition-colors" />
                              )}
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ArrowRightUpIcon className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onCloseMobile}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md text-sm transition-all font-normal px-3 py-1.5 group",
                            isActive
                              ? "text-black font-normal bg-slate-200/80 shadow-2xs"
                              : "text-slate-900 hover:text-black hover:bg-slate-200/50"
                          )}
                        >
                          {ItemIcon && (
                            <ItemIcon
                              className={cn(
                                "w-4.5 h-4.5 shrink-0 transition-colors",
                                isActive ? "text-slate-950" : "text-slate-700 group-hover:text-black"
                              )}
                            />
                          )}
                          <span className="truncate">{item.label}</span>
                          {item.href === "/admin/penyimpanan" && (health?.isCritical || health?.isWarning) && (
                            <span
                              className={cn(
                                "ml-auto w-2 h-2 rounded-full shrink-0",
                                health.isCritical ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                              )}
                              title={
                                health.isCritical
                                  ? "Kapasitas R2 kritis (≥95%)"
                                  : "Kapasitas R2 mendekati batas (≥80%)"
                              }
                            />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
