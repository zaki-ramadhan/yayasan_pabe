import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Panel Admin Yayasan",
  description: "Dasbor pengelolaan program, rekam penyaluran, dan mutasi donasi Yayasan Payung Berkah.",
};

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("pabe_session")?.value || cookieStore.get("ygsm_session")?.value;
  const role = cookieStore.get("pabe_role")?.value || cookieStore.get("ygsm_role")?.value;

  if (!session || !role || role === "DONOR") {
    notFound();
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
