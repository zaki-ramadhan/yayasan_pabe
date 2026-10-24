import { getAdminRoutineDonations } from "@/services/adminRoutineDonationService";
import { AdminRoutineDonationTable } from "@/components/admin/routine-donations/AdminRoutineDonationTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Komitmen Donasi Rutin",
  description: "Pantau komitmen donasi rutin, jadwal auto debet, dan pengingat kebaikan donatur yayasan.",
};

export default async function AdminRoutineDonationPage() {
  const { items } = await getAdminRoutineDonations({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Komitmen donasi rutin"
        description="Pantau jadwal dan status donasi rutin dari donatur."
      />

      <AdminRoutineDonationTable initialRoutineDonations={items} />
    </div>
  );
}
