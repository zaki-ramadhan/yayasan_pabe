import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { ResetPasswordCard } from "@/components/auth/ResetPasswordCard";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atur Ulang Kata Sandi - Yayasan PABE",
  description: "Buat kata sandi baru untuk akun Yayasan Payung Berkah Anda.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  return (
    <AuthSplitLayout mode="reset-password">
      <Suspense fallback={<AuthFormSkeleton mode="login" />}>
        <ResetPasswordCard token={token} siteKey={siteKey} />
      </Suspense>
    </AuthSplitLayout>
  );
}
