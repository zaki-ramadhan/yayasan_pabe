import { getAdminRoutineDonations } from "@/services/adminRoutineDonationService";
import { AdminRoutineDonationTable } from "@/components/admin/routine-donations/AdminRoutineDonationTable";

export const metadata = {
  title: "Komitmen Donasi Rutin",
  description: "Pantau komitmen donasi rutin, jadwal auto debet, dan pengingat kebaikan donatur yayasan.",
};

export default async function AdminRoutineDonationPage() {
  const { items } = await getAdminRoutineDonations({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Komitmen donasi rutin
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau komitmen kebaikan berkelanjutan para donatur, jadwal debet atau pengingat sedekah, serta status keaktifan program.
        </p>
      </div>

      <AdminRoutineDonationTable initialRoutineDonations={items} />
    </div>
  );
}
