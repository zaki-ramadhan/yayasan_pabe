import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Panel Admin Yayasan",
  description: "Dasbor pengelolaan program, rekam penyaluran, dan mutasi donasi Yayasan Payung Berkah.",
};

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("pabe_session")?.value;
  const role = cookieStore.get("pabe_role")?.value;

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (!role || role === "DONOR") {
    redirect("/login?error=forbidden&redirect=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
