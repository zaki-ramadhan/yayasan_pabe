"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAuth = async () => {
      try {
        const userParam = searchParams.get("user");
        const providerParam = searchParams.get("provider") || "Sosial";
        const redirectParam = searchParams.get("redirect") || "/admin";
        const errorParam = searchParams.get("error");

        toast.dismiss();

        if (errorParam) {
          setStatus("error");
          setErrorMessage(
            errorParam === "fb_cancelled"
              ? "Autentikasi Facebook dibatalkan oleh pengguna."
              : "Gagal memproses autentikasi. Silakan coba kembali."
          );
          toast.error("Autentikasi belum selesai atau dibatalkan.");
          return;
        }

        if (!userParam) {
          setStatus("error");
          setErrorMessage("Data autentikasi tidak ditemukan.");
          return;
        }

        const user = JSON.parse(userParam);
        if (!user || !user.name) {
          throw new Error("Format profil tidak valid.");
        }

        // Save user session
        loginUser(user);

        const providerLabel =
          providerParam.toLowerCase() === "facebook" ? "Facebook" : "Google";
        toast.success(`Selamat datang, ${user.name}! Masuk via ${providerLabel}.`);

        let targetRedirect = searchParams.get("redirect");
        if (targetRedirect?.startsWith("/dashboard")) {
          targetRedirect = targetRedirect.replace(/^\/dashboard/, "/admin");
        }
        if (!targetRedirect) {
          targetRedirect = user?.role === "DONOR" ? "/donatur/dashboard" : "/admin";
        }

        setStatus("success");
        setTimeout(() => {
          router.replace(targetRedirect);
        }, 400);
      } catch (err) {
        console.error("Auth callback client parsing error:", err);
        setStatus("error");
        setErrorMessage("Terjadi kesalahan saat memproses data akun.");
        toast.error("Gagal menyelesaikan login sosial.");
      }
    };

    processAuth();
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">Autentikasi Gagal</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{errorMessage}</p>
          </div>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
          {status === "success" ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          )}
        </div>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-slate-900">
            {status === "success"
              ? "Autentikasi Berhasil"
              : "Menghubungkan Akun..."}
          </h1>
          <p className="text-sm text-slate-500">
            {status === "success"
              ? "Mengalihkan Anda ke portal donatur..."
              : "Mohon tunggu sejenak, kami sedang memverifikasi kredensial Anda."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-sm text-slate-500">Memuat status login...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
