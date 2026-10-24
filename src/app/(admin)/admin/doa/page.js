import prisma from "@/lib/prisma";
import { getAdminPrayers } from "@/services/prayerService";
import { AdminPrayerTable } from "@/components/admin/prayers/AdminPrayerTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Moderasi Doa Donatur",
  description: "Pantau dan kelola doa dari donatur.",
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
      <AdminPageHeader
        title="Moderasi doa donatur"
        description="Pantau dan kelola doa yang masuk dari donatur."
      />

      <AdminPrayerTable
        initialData={prayersData}
        campaigns={campaigns}
      />
    </div>
  );
}
