import { getAdminGalleryItems } from "@/services/adminGalleryService";
import { AdminGalleryTable } from "@/components/admin/gallery/AdminGalleryTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Galeri Dokumentasi Kegiatan",
  description: "Manajemen arsip dokumentasi foto, bukti penyaluran lapangan, dan rekam jejak historis yayasan.",
};

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const result = await getAdminGalleryItems({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Galeri dokumentasi kegiatan"
        description="Kelola dan arsipkan foto-foto kegiatan lapangan, santunan, serta rekam jejak program yayasan."
      />

      <AdminGalleryTable
        initialItems={result.items}
        initialPagination={{
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        }}
        initialCategories={result.categories}
        initialEditId={resolvedParams?.edit}
      />
    </div>
  );
}
