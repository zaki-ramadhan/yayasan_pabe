import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Akun Donatur",
  description: "Masuk ke akun donatur Yayasan Payung Berkah untuk mengelola infaq rutin dan e-Kwitansi. Hidup Berkah dengan Sedekah.",
};

export default function LoginPage() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    "";

  return (
    <AuthSplitLayout mode="login">
      <Suspense fallback={<AuthFormSkeleton mode="login" />}>
        <LoginForm siteKey={turnstileSiteKey} />
      </Suspense>
    </AuthSplitLayout>
  );
}
