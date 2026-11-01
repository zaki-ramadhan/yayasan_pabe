import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { ActivationNoticeCard } from "@/components/auth/ActivationNoticeCard";

export const metadata = {
  title: "Verifikasi Email Akun - Yayasan PABE",
  description: "Silakan verifikasi email Anda untuk mengaktifkan akun donatur Yayasan Payung Berkah.",
};

export default function VerificationNoticePage() {
  return (
    <AuthSplitLayout mode="register">
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat status verifikasi...</div>}>
        <ActivationNoticeCard />
      </Suspense>
    </AuthSplitLayout>
  );
}
