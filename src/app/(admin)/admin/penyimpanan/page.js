import { getStorageOverview } from "@/services/adminStorageService";
import { AdminStorageManager } from "@/components/admin/storage/AdminStorageManager";

export const metadata = {
  title: "Penyimpanan & Media R2",
  description: "Manajemen kuota penyimpanan Cloudflare R2 dan pembersihan berkas sampah tak terpakai.",
};

export const dynamic = "force-dynamic";

export default async function AdminStoragePage() {
  const overview = await getStorageOverview();

  return <AdminStorageManager initialOverview={overview} />;
}
