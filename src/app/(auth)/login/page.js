import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const metadata = {
  title: "Masuk ke Akun",
  description: "Masuk ke akun donatur Yayasan Payung Berkah untuk mengelola infaq rutin dan e-Kwitansi.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout mode="login">
      <Suspense fallback={<AuthFormSkeleton mode="login" />}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
