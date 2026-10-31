"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  fetchVolunteerStatus,
  submitVolunteerRegistration,
  cancelVolunteerRegistration,
} from "@/services/volunteerClientService";
import {
  validateName,
  validatePhone,
  validateEmail,
  stripEmojis,
  sanitizePhone,
} from "@/lib/security";

// Sub-widgets modular
import { VolunteerApprovedCard } from "@/components/volunteer/VolunteerApprovedCard";
import { VolunteerPendingCard } from "@/components/volunteer/VolunteerPendingCard";
import { VolunteerRegistrationFields } from "@/components/volunteer/VolunteerRegistrationFields";
import { VolunteerCancellationDialog } from "@/components/volunteer/VolunteerCancellationDialog";

const DRAFT_STORAGE_KEY = "pabe_volunteer_draft";

function getInitialDraft() {
  if (typeof window === "undefined") return {};
  try {
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Layout Coordinator untuk pendaftaran dan status relawan (Thin Orchestrator).
 * Mencegah spam pendaftaran ganda dan mengunci nama akun login secara otomatis.
 */
export function VolunteerForm() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const activeUser = currentUser || (typeof window !== "undefined" ? getStoredUser() : null);
  const userEmail = activeUser?.email || "";

  // 1. Initial State Derived Lazily (Zero Cascading setState in Effect)
  const [fullName, setFullName] = useState(() => {
    if (activeUser?.name && activeUser.name !== "Pengguna Google" && activeUser.name !== "Pengguna Facebook") {
      return activeUser.name;
    }
    const draft = getInitialDraft();
    return draft.fullName || "";
  });

  const isNameLocked = Boolean(
    activeUser?.name &&
    activeUser.name !== "Pengguna Google" &&
    activeUser.name !== "Pengguna Facebook"
  );

  const [email, setEmail] = useState(() => {
    if (activeUser?.email && !activeUser.email.endsWith("@google.user") && !activeUser.email.endsWith("@facebook.user")) {
      return activeUser.email;
    }
    const draft = getInitialDraft();
    return draft.email || "";
  });

  const isEmailLocked = Boolean(
    activeUser?.email &&
    !activeUser.email.endsWith("@google.user") &&
    !activeUser.email.endsWith("@facebook.user")
  );

  const [phone, setPhone] = useState(() => {
    if (activeUser?.phone && activeUser.phone !== "-") {
      const clean = sanitizePhone(activeUser.phone);
      if (clean) return clean;
    }
    const draft = getInitialDraft();
    return draft.phone || "";
  });

  const [city, setCity] = useState(() => getInitialDraft().city || "");
  const [motivation, setMotivation] = useState(() => getInitialDraft().motivation || "");

  // Status Relawan Terdaftar
  const [volunteer, setVolunteer] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(() => Boolean(userEmail));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // 2. Cek status keanggotaan relawan saat userEmail tersedia
  useEffect(() => {
    let isMounted = true;

    if (!userEmail) {
      return;
    }

    async function checkStatus() {
      const res = await fetchVolunteerStatus(userEmail);
      if (isMounted) {
        setVolunteer(res.success && res.data ? res.data : null);
        setCheckingStatus(false);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // 3. Draft Auto-save
  useEffect(() => {
    if (volunteer) return;
    try {
      if (fullName || phone || email || city || motivation) {
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ fullName, phone, email, city, motivation })
        );
      }
    } catch {
      // ignore
    }
  }, [fullName, phone, email, city, motivation, volunteer]);

  // Validasi Form (Derived State)
  const cleanCity = stripEmojis(city)
    .replace(/[^a-zA-ZÀ-ÿ\s.,'-]/g, "")
    .trim();
  const isFormValid = Boolean(
    validateName(fullName).isValid &&
    validatePhone(phone).isValid &&
    validateEmail(email, true).isValid &&
    cleanCity.length >= 2
  );

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameCheck = validateName(fullName);
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error;

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) newErrors.phone = phoneCheck.error;

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) newErrors.email = emailCheck.error;

    if (!city || city.trim().length < 2) {
      newErrors.city = "Kota domisili minimal 2 karakter.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Mohon periksa kembali kolom formulir yang belum valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitVolunteerRegistration({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        city: city.trim(),
        motivation: motivation.trim().slice(0, 500),
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success(res.message);

      // Refresh status relawan
      const statusRes = await fetchVolunteerStatus(email.trim().toLowerCase());
      if (statusRes.success && statusRes.data) {
        setVolunteer(statusRes.data);
      }

      const user = getStoredUser() || currentUser;
      if (!user) {
        router.push("/login?redirect=/donatur/relawan");
      }
    } catch (err) {
      toast.error(err.message || "Gagal mengirim pendaftaran relawan.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel / Resign Volunteer Action
  const handleConfirmCancel = async () => {
    const targetEmail = volunteer?.email || email;
    if (!targetEmail) return;

    setCancelling(true);
    try {
      const res = await cancelVolunteerRegistration(targetEmail);
      if (res.success) {
        toast.success(res.message);
        setVolunteer(null);
        setIsCancelModalOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Terjadi kesalahan saat membatalkan pendaftaran.");
    } finally {
      setCancelling(false);
    }
  };

  // State A: Sedang Memeriksa Status Relawan (Skeleton Loader)
  if (checkingStatus) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 animate-pulse">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-11 w-full rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    );
  }

  // State B: Sudah Terdaftar dan Disetujui (APPROVED)
  if (volunteer && volunteer.isApproved) {
    return (
      <>
        <VolunteerApprovedCard
          volunteer={volunteer}
          onResignClick={() => setIsCancelModalOpen(true)}
        />
        <VolunteerCancellationDialog
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          status="APPROVED"
          isLoading={cancelling}
        />
      </>
    );
  }

  // State C: Sudah Mendaftar namun Masih Ditinjau (PENDING)
  if (volunteer && volunteer.status === "PENDING") {
    return (
      <>
        <VolunteerPendingCard
          volunteer={volunteer}
          onCancelClick={() => setIsCancelModalOpen(true)}
        />
        <VolunteerCancellationDialog
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          status="PENDING"
          isLoading={cancelling}
        />
      </>
    );
  }

  // State D: Belum Terdaftar (Tampilkan Form Input Bersih)
  return (
    <VolunteerRegistrationFields
      fullName={fullName}
      setFullName={setFullName}
      isNameLocked={isNameLocked}
      phone={phone}
      setPhone={setPhone}
      email={email}
      setEmail={setEmail}
      isEmailLocked={isEmailLocked}
      city={city}
      setCity={setCity}
      motivation={motivation}
      setMotivation={setMotivation}
      loading={loading}
      isFormValid={isFormValid}
      errors={errors}
      setErrors={setErrors}
      onSubmit={handleSubmit}
    />
  );
}

export default VolunteerForm;
