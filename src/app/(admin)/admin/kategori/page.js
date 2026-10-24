import { redirect } from "next/navigation";

export const metadata = {
  title: "Kategori Program",
  description: "Kategori program kini dikelola langsung secara dinamis melalui formulir program.",
};

export default function AdminCategoryPage() {
  redirect("/admin/program");
}

