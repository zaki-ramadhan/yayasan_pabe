import Link from "next/link";
import { ErrorView } from "@/components/shared/ErrorView";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan",
  description: "Maaf, halaman atau program yang Anda cari tidak tersedia atau telah dipindahkan.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <ErrorView
        statusCode={404}
        title="Halaman Tidak Ditemukan"
        description="Maaf, halaman atau program yang Anda cari tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda."
        primaryAction={
          <Button asChild variant="primary3d" className="px-7 h-11 text-sm rounded-lg shadow-md cursor-pointer">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        }
      />
    </div>
  );
}
