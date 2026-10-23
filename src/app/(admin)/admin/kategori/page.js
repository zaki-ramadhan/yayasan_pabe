import { getAdminCategories } from "@/services/categoryService";
import { AdminCategoryTable } from "@/components/admin/categories/AdminCategoryTable";

export const metadata = {
  title: "Kategori Program",
  description: "Kelola daftar kategori program kampanye dan pengelompokan donasi yayasan.",
};

export default async function AdminCategoryPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Kategori program donasi
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola kategori untuk mengelompokkan program kampanye, mengatur tautan pengenal (slug), dan filter publik.
        </p>
      </div>

      <AdminCategoryTable initialCategories={categories} />
    </div>
  );
}
