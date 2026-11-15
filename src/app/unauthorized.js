import Link from "next/link";
import { ErrorStandaloneLayout } from "@/components/shared/ErrorStandaloneLayout";
import { ErrorView } from "@/components/shared/ErrorView";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "401 - Sesi Berakhir",
  description: "Silakan masuk kembali untuk mengakses akun Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Unauthorized() {
  return (
    <ErrorStandaloneLayout>
      <ErrorView
        statusCode={401}
        title="Sesi Telah Berakhir"
        description="Waktu sesi masuk Anda telah habis demi keamanan akun. Silakan masuk kembali untuk melanjutkan aktivitas Anda."
        primaryAction={
          <Button asChild variant="primary3d" className="px-7 h-11 text-sm rounded-lg shadow-md cursor-pointer">
            <Link href="/login">
              Masuk Kembali
            </Link>
          </Button>
        }
      />
    </ErrorStandaloneLayout>
  );
}
