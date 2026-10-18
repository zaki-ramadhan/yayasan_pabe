import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Daftar Akun Baru",
  description: "Daftar akun donatur Yayasan PABE untuk mulai menyalurkan infaq dan sedekah terpercaya.",
};

export default function RegisterPage() {
  return (
    <AuthSplitLayout mode="register">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-sm">Memuat formulir...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthSplitLayout>
  );
}

