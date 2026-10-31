import { getStorageOverview } from "@/services/adminStorageService";
import { AdminStorageManager } from "@/components/admin/storage/AdminStorageManager";

export const metadata = {
  title: "Penyimpanan Berkas",
  description: "Kelola kuota penyimpanan dan pembersihan berkas tidak terpakai.",
};

export const dynamic = "force-dynamic";

export default async function AdminStoragePage() {
  const overview = await getStorageOverview();

  return <AdminStorageManager initialOverview={overview} />;
}
