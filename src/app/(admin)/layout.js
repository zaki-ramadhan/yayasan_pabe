import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel Admin Yayasan",
  description: "Dasbor pengelolaan program, rekam penyaluran, dan mutasi donasi Yayasan Payung Berkah.",
};

export default async function AdminLayout({ children }) {
  const { authenticated, user } = await getAuthenticatedUser();

  if (!authenticated || !user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role === "DONOR") {
    redirect("/donatur/dashboard");
  }

  return <AdminLayoutClient initialUser={user}>{children}</AdminLayoutClient>;
}
