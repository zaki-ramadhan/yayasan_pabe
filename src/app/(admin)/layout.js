import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Portal Administrator Yayasan",
  description: "Dasbor pengelolaan program, rekam penyaluran, dan mutasi donasi Yayasan Generasi Sejahtera Mandiri.",
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
