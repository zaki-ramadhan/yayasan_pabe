import Link from "next/link";
import { ErrorStandaloneLayout } from "@/components/shared/ErrorStandaloneLayout";
import { ErrorView } from "@/components/shared/ErrorView";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "403 - Akses Dibatasi",
  description: "Anda tidak memiliki izin untuk membuka halaman ini.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Forbidden() {
  return (
    <ErrorStandaloneLayout>
      <ErrorView
        statusCode={403}
        title="Akses Dibatasi"
        description="Anda tidak memiliki izin untuk membuka halaman ini. Silakan kembali ke beranda untuk melanjutkan aktivitas Anda."
        primaryAction={
          <Button asChild variant="primary3d" className="px-7 h-11 text-sm rounded-lg shadow-md cursor-pointer">
            <Link href="/">
              Kembali ke Beranda
            </Link>
          </Button>
        }
      />
    </ErrorStandaloneLayout>
  );
}
