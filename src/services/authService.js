// Authentication Service with Multi-Role Role-Based Access Control (RBAC)

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  FINANCE: "FINANCE",
  VOLUNTEER: "VOLUNTEER",
  DONOR: "DONOR",
};

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin (Ketua Yayasan)",
  ADMIN: "Admin Program & Penyaluran",
  FINANCE: "Finance & Bendahara",
  VOLUNTEER: "Relawan Lapangan",
  DONOR: "Donatur / Muzakki",
};

export const DEMO_USERS = [
  {
    id: "USR-001",
    name: "Drs. H. M. Fauzan, M.Pd",
    username: "superadmin",
    email: "superadmin@pabe.or.id",
    role: USER_ROLES.SUPER_ADMIN,
    title: "Ketua Dewan Pengurus Yayasan",
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
    title: `Donatur Terdaftar (${isGoogle ? "Google" : "Facebook"})`,
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
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem("ygsm_auth_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loginUser(user) {
  if (typeof window === "undefined") return;
  const userJson = JSON.stringify(user);
  localStorage.setItem(AUTH_STORAGE_KEY, userJson);
  localStorage.setItem("ygsm_auth_user", userJson);
  localStorage.setItem("pabe_auth_session", userJson);
  localStorage.setItem("ygsm_auth_session", userJson);
  sessionStorage.setItem("pabe_just_logged_in", user.name || "Donatur");
  sessionStorage.setItem("ygsm_just_logged_in", user.name || "Donatur");

  window.dispatchEvent(new Event("pabe_auth_change"));
  window.dispatchEvent(new Event("ygsm_auth_change"));
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
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password, rememberMe }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Gagal masuk ke akun.");
  }

  loginUser(data.data);
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
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, name, email, phone, password }),
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

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("ygsm_auth_user");
  localStorage.removeItem("pabe_auth_session");
  localStorage.removeItem("ygsm_auth_session");
  sessionStorage.removeItem("pabe_just_logged_in");
  sessionStorage.removeItem("ygsm_just_logged_in");
  sessionStorage.removeItem("zakat_calculator_state");

  // Invalidate session cookie immediately
  document.cookie = "pabe_session=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "ygsm_session=; path=/; max-age=0; SameSite=Lax";

  // Trigger server logout if available
  try {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  } catch {}

  window.dispatchEvent(new Event("pabe_auth_change"));
  window.dispatchEvent(new Event("ygsm_auth_change"));
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
  return "/dashboard";
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
