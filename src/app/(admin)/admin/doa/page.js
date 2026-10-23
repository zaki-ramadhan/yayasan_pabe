import prisma from "@/lib/prisma";
import { getAdminPrayers } from "@/services/prayerService";
import { AdminPrayerTable } from "@/components/admin/prayers/AdminPrayerTable";

export const metadata = {
  title: "Moderasi Doa Donatur",
  description: "Kelola dan moderasi doa, pesan harapan, serta tanggapan resmi yayasan untuk donatur.",
};

export default async function AdminPrayerPage() {
  const [prayersData, campaigns] = await Promise.all([
    getAdminPrayers({ limit: 15 }),
    prisma.campaign.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Moderasi doa donatur
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau doa donatur dari transaksi publik, sembunyikan pesan tidak pantas, sematkan doa pilihan, dan kirimkan balasan resmi yayasan.
        </p>
      </div>

      <AdminPrayerTable
        initialData={prayersData}
        campaigns={campaigns}
      />
    </div>
  );
}
