"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, updateStoredUser } from "@/services/authService";
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

import { VolunteerApprovedBanner } from "@/components/volunteer/VolunteerApprovedBanner";
import { VolunteerPendingCard } from "@/components/volunteer/VolunteerPendingCard";
import { VolunteerRegistrationFields } from "@/components/volunteer/VolunteerRegistrationFields";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";
import { VolunteerCancellationDialog } from "@/components/volunteer/VolunteerCancellationDialog";

const DRAFT_STORAGE_KEY = "pabe_volunteer_draft";

function getInitialDraft(currentUserEmail = "") {
  if (typeof window === "undefined") return {};
  try {
    const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    if (
      currentUserEmail &&
      parsed.email &&
      parsed.email.trim().toLowerCase() !== currentUserEmail.trim().toLowerCase()
    ) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return {};
    }
    return parsed;
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

  const isNameLocked = Boolean(
    activeUser?.name &&
    activeUser.name !== "Pengguna Google" &&
    activeUser.name !== "Pengguna Facebook"
  );

  const isEmailLocked = Boolean(
    activeUser?.email &&
    !activeUser.email.endsWith("@google.user") &&
    !activeUser.email.endsWith("@facebook.user")
  );

  const [fullName, setFullName] = useState(() => {
    if (isNameLocked) {
      return activeUser.name;
    }
    const draft = getInitialDraft(activeUser?.email);
    return draft.fullName || "";
  });

  const [email, setEmail] = useState(() => {
    if (isEmailLocked) {
      return activeUser.email;
    }
    const draft = getInitialDraft(activeUser?.email);
    return draft.email || "";
  });

  const [phone, setPhone] = useState(() => {
    if (activeUser?.phone && activeUser.phone !== "-") {
      const clean = sanitizePhone(activeUser.phone);
      if (clean) return clean;
    }
    const draft = getInitialDraft(activeUser?.email);
    return draft.phone || "";
  });

  const [city, setCity] = useState(() => {
    if (activeUser?.city && activeUser.city.trim()) {
      return activeUser.city.trim();
    }
    const draft = getInitialDraft(activeUser?.email);
    return draft.city || "";
  });
  const [motivation, setMotivation] = useState(() => getInitialDraft(activeUser?.email).motivation || "");

  const [volunteer, setVolunteer] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!activeUser) return;

    if (
      activeUser.name &&
      activeUser.name !== "Pengguna Google" &&
      activeUser.name !== "Pengguna Facebook"
    ) {
      setFullName((prev) =>
        !prev || prev === "Pengguna Google" || prev === "Pengguna Facebook"
          ? activeUser.name
          : prev
      );
    }

    if (
      activeUser.email &&
      !activeUser.email.endsWith("@google.user") &&
      !activeUser.email.endsWith("@facebook.user")
    ) {
      setEmail(activeUser.email);
    }

    if (activeUser.phone && activeUser.phone !== "-") {
      const clean = sanitizePhone(activeUser.phone);
      if (clean) {
        setPhone((prev) => (!prev ? clean : prev));
      }
    }

    if (activeUser.city && activeUser.city.trim()) {
      setCity((prev) => (!prev ? activeUser.city.trim() : prev));
    }
  }, [activeUser]);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      const active = currentUser || getStoredUser();
      const targetEmail = active?.email;

      if (!targetEmail) {
        if (isMounted) {
          setCheckingStatus(false);
        }
        return;
      }

      const res = await fetchVolunteerStatus(targetEmail);
      if (isMounted) {
        setVolunteer(res.success && res.data ? res.data : null);
        setCheckingStatus(false);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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
    }
  }, [fullName, phone, email, city, motivation, volunteer]);

  const cleanCity = stripEmojis(city)
    .replace(/[^a-zA-ZÀ-ÿ\s.,'-]/g, "")
    .trim();
  const isFormValid = Boolean(
    validateName(fullName).isValid &&
    validatePhone(phone).isValid &&
    validateEmail(email, true).isValid &&
    cleanCity.length >= 2
  );

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
        motivation: motivation.trim().slice(0, FIELD_LIMITS.MOTIVATION.max),
        turnstileToken,
      });

      if (!res.success) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        throw new Error(res.message);
      }

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success(res.message);

      if (activeUser && (!activeUser.phone || activeUser.phone === "-") && phone.trim()) {
        updateStoredUser({ phone: phone.trim() });
      }

      const statusRes = await fetchVolunteerStatus(email.trim().toLowerCase());
      if (statusRes.success && statusRes.data) {
        setVolunteer(statusRes.data);
      }

      const user = getStoredUser() || currentUser;
      if (!user) {
        router.push("/login?redirect=/donatur/relawan");
      }
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      const errorMessage = err.message || "Gagal mengirim pendaftaran relawan.";
      toast.error(errorMessage);

      if (errorMessage.toLowerCase().includes("whatsapp")) {
        setErrors((prev) => ({
          ...prev,
          phone: errorMessage,
        }));
      } else if (errorMessage.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: errorMessage,
        }));
      }

      if (email && email.trim()) {
        fetchVolunteerStatus(email.trim().toLowerCase()).then((statusRes) => {
          if (statusRes.success && statusRes.data) {
            setVolunteer(statusRes.data);
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (checkingStatus) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 animate-pulse">
        <div className="space-y-1.5">
          <Skeleton className="h-6 sm:h-7 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded" />
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Skeleton className="h-4 w-52 rounded" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>

        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    );
  }

  if (volunteer && volunteer.isApproved) {
    return <VolunteerApprovedBanner volunteer={volunteer} />;
  }

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
      turnstileToken={turnstileToken}
      setTurnstileToken={setTurnstileToken}
      turnstileRef={turnstileRef}
      onSubmit={handleSubmit}
    />
  );
}

export default VolunteerForm;
