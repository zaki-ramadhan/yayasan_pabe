import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Masuk ke Akun",
  description: "Masuk ke akun donatur Yayasan PABE untuk mengelola infaq rutin dan e-Kwitansi.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout mode="login">
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400 text-sm">Memuat formulir...</div>}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
