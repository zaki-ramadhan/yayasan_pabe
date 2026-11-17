"use client";

import { useEffect } from "react";
import { ErrorStandaloneLayout } from "@/components/shared/ErrorStandaloneLayout";
import { ErrorView } from "@/components/shared/ErrorView";
import { Button } from "@/components/ui/Button";

export default function GlobalRouteError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[App Error Boundary]:", error);
    }
  }, [error]);

  return (
    <ErrorStandaloneLayout>
      <ErrorView
        statusCode={500}
        title="Halaman Sedang Mengalami Kendala"
        description="Terjadi gangguan sementara saat memuat halaman ini. Silakan coba muat ulang atau kembali beberapa saat lagi."
        primaryAction={
          <Button
            type="button"
            variant="primary3d"
            onClick={() => reset()}
            className="px-7 h-11 text-sm rounded-lg shadow-md cursor-pointer"
          >
            Coba Muat Ulang
          </Button>
        }
      />
    </ErrorStandaloneLayout>
  );
}
