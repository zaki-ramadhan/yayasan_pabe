import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const metadata = {
  title: "Daftar Akun Baru",
  description: "Daftar akun donatur Yayasan Generasi Sejahtera Mandiri untuk mulai menyalurkan infaq dan sedekah terpercaya.",
};

export default function RegisterPage() {
  return (
    <AuthSplitLayout mode="register">
      <Suspense fallback={<AuthFormSkeleton mode="register" />}>
        <RegisterForm />
      </Suspense>
    </AuthSplitLayout>
  );
}

