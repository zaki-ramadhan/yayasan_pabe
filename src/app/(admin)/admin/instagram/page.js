import {
  getAdminInstagramPosts,
  getAdminInstagramProfile,
} from "@/services/adminInstagramService";
import { AdminInstagramView } from "@/components/admin/instagram/AdminInstagramView";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Manajemen Feed Instagram",
  description: "Kelola profil akun Instagram resmi yayasan dan postingan feed media sosial.",
};

export const dynamic = "force-dynamic";

export default async function AdminInstagramPage() {
  const [postsData, profileData] = await Promise.all([
    getAdminInstagramPosts({ limit: 8 }),
    getAdminInstagramProfile(),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Manajemen feed Instagram"
        description="Kelola akun Instagram resmi yayasan dan postingan media sosial secara manual dan mandiri."
      />

      <AdminInstagramView
        initialPosts={postsData.items}
        initialPagination={{
          total: postsData.total,
          page: postsData.page,
          limit: postsData.limit,
          totalPages: postsData.totalPages,
        }}
        initialProfile={profileData}
      />
    </div>
  );
}
