"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/services/authService";
import { toast } from "@/hooks/useToast";
import { AuthVerificationSpinner } from "@/components/auth/AuthVerificationSpinner";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  const providerParam = searchParams.get("provider") || "google";

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAuth = async () => {
      try {
        const userParam = searchParams.get("user");
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

        loginUser(user);

        const providerLabel =
          providerParam.toLowerCase() === "facebook" ? "Facebook" : "Google";
        toast.success(`Selamat datang, ${user.name}! Masuk via ${providerLabel}.`);

        let rawTarget = searchParams.get("redirect");
        if (rawTarget?.startsWith("/dashboard")) {
          rawTarget = rawTarget.replace(/^\/dashboard/, "/admin");
        }

        const isStaff = user?.role && user.role !== "DONOR";
        let targetRedirect = "/donatur/dashboard";
        if (isStaff) {
          const isAdminPath = rawTarget && (rawTarget === "/admin" || rawTarget.startsWith("/admin/"));
          targetRedirect = isAdminPath ? rawTarget : "/admin";
        } else {
          const isAdminPath = rawTarget && (rawTarget === "/admin" || rawTarget.startsWith("/admin/"));
          targetRedirect = (isAdminPath || !rawTarget) ? "/donatur/dashboard" : rawTarget;
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
  }, [router, searchParams, providerParam]);

  return (
    <AuthVerificationSpinner
      provider={providerParam}
      status={status}
      errorMessage={errorMessage}
    />
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthVerificationSpinner
          provider="google"
          status="processing"
        />
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
