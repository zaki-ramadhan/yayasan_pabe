import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const metadata = {
  title: "Daftar Donatur Baru",
  description: "Daftar akun donatur Yayasan Payung Berkah untuk mulai menyalurkan infaq dan sedekah terpercaya. Hidup Berkah dengan Sedekah.",
};

export default function RegisterPage() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    process.env.TURNSTILE_SITE_KEY ||
    "";

  return (
    <AuthSplitLayout mode="register">
      <Suspense fallback={<AuthFormSkeleton mode="register" />}>
        <RegisterForm siteKey={turnstileSiteKey} />
      </Suspense>
    </AuthSplitLayout>
  );
}

