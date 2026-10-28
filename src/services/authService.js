import { safeFetch } from "@/lib/safeFetch";

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  FINANCE: "FINANCE",
  VOLUNTEER: "VOLUNTEER",
  DONOR: "DONOR",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin Yayasan",
  DONOR: "Donatur / Muzakki",
  FINANCE: "Admin Yayasan (Finance)",
  VOLUNTEER: "Relawan Lapangan",
};

export const DEMO_USERS = [
  {
    id: "USR-001",
    name: "Drs. H. M. Fauzan, M.Pd",
    username: "superadmin",
    email: "superadmin@pabe.or.id",
    role: USER_ROLES.SUPER_ADMIN,
    title: "Super Admin",
    phone: "0811-2233-4455",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    initials: "HF",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
  },
  {
    id: "USR-002",
    name: "Ust. Rian Ramadhan",
    username: "admin.program",
    email: "admin.program@pabe.or.id",
    role: USER_ROLES.ADMIN,
    title: "Kepala Divisi Program & Operasional",
    phone: "0812-3344-5566",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    initials: "RR",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
  },
  {
    id: "USR-003",
    name: "Hj. Annisa Fitriani, S.E., Ak.",
    username: "finance",
    email: "finance@pabe.or.id",
    role: USER_ROLES.FINANCE,
    title: "Bendahara & Rekonsiliasi ZISWAF",
    phone: "0813-4455-6677",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    initials: "AF",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    id: "USR-004",
    name: "Bagas Pratama",
    username: "bagas.relawan",
    email: "bagas.relawan@gmail.com",
    role: USER_ROLES.VOLUNTEER,
    title: "Koordinator Relawan Aksi Lapangan",
    phone: "0857-1122-3344",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    initials: "BP",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
  },
  {
    id: "USR-005",
    name: "H. Hendra Wijaya",
    username: "hendra.donatur",
    email: "hendra.donatur@gmail.com",
    role: USER_ROLES.DONOR,
    title: "Muzakki & Donatur Tetap",
    phone: "0818-9988-7766",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    initials: "HW",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
  },
];

export const AUTH_STORAGE_KEY = "pabe_auth_user";
const REMEMBER_KEY = "pabe_remember_identifier";

/**
 * Durasi Sesi Aman (dalam Detik):
 * - Admin/Staf: 12 jam (maksimal 24 jam dengan "Ingat Saya" demi keamanan keuangan/data)
 * - Donatur: 7 hari (30 hari dengan "Ingat Saya")
 */
export const SESSION_DURATIONS = {
  ADMIN_DEFAULT: 12 * 60 * 60, // 12 jam
  ADMIN_REMEMBER: 24 * 60 * 60, // 24 jam
  DONOR_DEFAULT: 7 * 24 * 60 * 60, // 7 hari
  DONOR_REMEMBER: 30 * 24 * 60 * 60, // 30 hari
};

export function getSessionDuration(role, rememberMe = false) {
  const isStaff = role && role !== USER_ROLES.DONOR;
  if (isStaff) {
    return rememberMe ? SESSION_DURATIONS.ADMIN_REMEMBER : SESSION_DURATIONS.ADMIN_DEFAULT;
  }
  return rememberMe ? SESSION_DURATIONS.DONOR_REMEMBER : SESSION_DURATIONS.DONOR_DEFAULT;
}

export function getInitials(name = "") {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatSocialUser({
  id,
  name,
  email,
  avatar,
  provider = "facebook",
}) {
  const isGoogle = provider === "google";
  const cleanName = name || (isGoogle ? "Pengguna Google" : "Pengguna Facebook");
  const sanitizedUsername = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 15);

  return {
    id: `USR-${isGoogle ? "GGL" : "FB"}-${id || Date.now()}`,
    name: cleanName,
    username: `${sanitizedUsername}_${String(id || Date.now()).slice(-4)}`,
    email: email || `${id || Date.now()}@${provider}.user`,
    role: USER_ROLES.DONOR,
    title: "Donatur",
    phone: "-",
    avatar:
      avatar ||
      (isGoogle
        ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"),
    initials: getInitials(cleanName),
    badgeColor: isGoogle
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : "bg-blue-100 text-blue-900 border-blue-300",
    provider,
    providerId: id || null,
  };
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem("pabe_auth_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    // Periksa apakah sesi lokal sudah kedaluwarsa
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      logoutUser();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function loginUser(user, options = {}) {
  if (typeof window === "undefined" || !user) return;

  const rememberMe = Boolean(options.rememberMe);
  const durationSec =
    user.expiresAt && typeof user.expiresAt === "number"
      ? Math.max(60, Math.floor((user.expiresAt - Date.now()) / 1000))
      : getSessionDuration(user?.role, rememberMe);

  const expiresAt = user.expiresAt || Date.now() + durationSec * 1000;

  const userWithSession = {
    ...user,
    expiresAt,
    sessionIssuedAt: user.sessionIssuedAt || Date.now(),
  };

  const userJson = JSON.stringify(userWithSession);
  localStorage.setItem(AUTH_STORAGE_KEY, userJson);
  localStorage.setItem("pabe_auth_session", userJson);
  sessionStorage.setItem("pabe_just_logged_in", user.name || "Donatur");
  sessionStorage.setItem("pabe_last_activity", String(Date.now()));

  // Clean up legacy keys if present
  try {
    localStorage.removeItem("ygsm_auth_user");
    localStorage.removeItem("ygsm_auth_session");
    sessionStorage.removeItem("ygsm_just_logged_in");
  } catch {}

  // Sync session cookie client-side sesuai durasi terhitung
  const userId = encodeURIComponent(user?.id || "USR-DONOR");
  const role = encodeURIComponent(user?.role || "DONOR");
  document.cookie = `pabe_session=${userId}; path=/; max-age=${durationSec}; SameSite=Lax`;
  document.cookie = `pabe_role=${role}; path=/; max-age=${durationSec}; SameSite=Lax`;

  window.dispatchEvent(new Event("pabe_auth_change"));
  window.dispatchEvent(new Event("storage"));
}

/**
 * Authenticates user via server API route and sets secure HttpOnly session cookies.
 * @param {object} params
 * @param {string} params.identifier
 * @param {string} params.password
 * @param {boolean} [params.rememberMe]
 * @returns {Promise<object>}
 */
export async function loginWithServer({ identifier, password, rememberMe = false }) {
  const res = await safeFetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password, rememberMe }),
    timeoutMs: 15000,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Gagal masuk ke akun.");
  }

  loginUser(data.data, { rememberMe });
  return data.data;
}

/**
 * Registers a new donor user via server API route and sets secure HttpOnly session cookies.
 * @param {object} params
 * @param {string} params.username
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.password
 * @returns {Promise<object>}
 */
export async function registerWithServer({ username, name, email, phone, password }) {
  const res = await safeFetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, name, email, phone, password }),
    timeoutMs: 15000,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Gagal mendaftarkan akun baru.");
  }

  loginUser(data.data);
  return data.data;
}

export function redirectToGoogleOAuth(callbackUrl = "/") {
  if (typeof window === "undefined") return;
  const target = `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = target;
}

export function redirectToFacebookOAuth(callbackUrl = "/", mode = "login") {
  if (typeof window === "undefined") return;
  const target = `/api/auth/facebook?callbackUrl=${encodeURIComponent(callbackUrl)}&mode=${encodeURIComponent(mode)}`;
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = target;
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("pabe_auth_session");
  sessionStorage.removeItem("pabe_just_logged_in");
  sessionStorage.removeItem("zakat_calculator_state");

  // Clean legacy keys
  try {
    localStorage.removeItem("ygsm_auth_user");
    localStorage.removeItem("ygsm_auth_session");
    sessionStorage.removeItem("ygsm_just_logged_in");
  } catch {}

  // Invalidate session cookie immediately
  document.cookie = "pabe_session=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "pabe_role=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "ygsm_session=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "ygsm_role=; path=/; max-age=0; SameSite=Lax";

  // Trigger server logout if available
  try {
    safeFetch("/api/auth/logout", { method: "POST", timeoutMs: 5000 }).catch(() => {});
  } catch {}

  window.dispatchEvent(new Event("pabe_auth_change"));
  window.dispatchEvent(new Event("storage"));
}

export function getRememberedIdentifier() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
}

export function setRememberedIdentifier(identifier) {
  if (typeof window === "undefined") return;
  try {
    if (identifier) {
      localStorage.setItem(REMEMBER_KEY, identifier);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {}
}

export function findUserByIdentifier(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  return DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.username && u.username.toLowerCase() === clean)
  );
}

export function getRedirectPathForRole(role) {
  if (role === USER_ROLES.DONOR) {
    return "/donatur/dashboard";
  }
  return "/admin";
}

export function simulateSocialAuth(provider = "google") {
  const isGoogle = provider === "google";
  return formatSocialUser({
    id: String(Date.now()),
    name: isGoogle ? "H. Hendra Wijaya" : "Siti Rahmawati",
    email: isGoogle ? "hendra.donatur@gmail.com" : "siti.rahmawati@facebook.com",
    avatar: isGoogle
      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    provider,
  });
}
