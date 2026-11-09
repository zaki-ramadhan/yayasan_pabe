import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { DEMO_USERS, USER_ROLES } from "@/services/authService";
import { getInitials } from "@/lib/formatters";
import { INFRASTRUCTURE_EMAILS } from "@/lib/infrastructureConstants";
import { createSignedSessionToken, verifySessionToken, isSignedSessionTokenFormat } from "@/lib/sessionToken";

export { createSignedSessionToken, verifySessionToken, isSignedSessionTokenFormat };

/**
 * Retrieves the list of super admin emails from the server-only environment variable.
 * Safe from exposure: Not prefixed with NEXT_PUBLIC_ so it is never bundled to the client.
 * @returns {string[]}
 */
export function getSuperAdminEmails() {
  const envVal = process.env.SUPER_ADMIN_EMAILS || "";
  const list = envVal
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);

  // Selalu sertakan akun super admin infrastruktur dan akun official yayasan
  [...INFRASTRUCTURE_EMAILS, "superadmin@pabe.or.id", "admin@payungberkah.org"].forEach((email) => {
    const clean = email.toLowerCase().trim();
    if (!list.includes(clean)) {
      list.push(clean);
    }
  });

  return list;
}

/**
 * Checks whether an email address belongs to a configured Super Admin.
 * Strictly executes on server side; case-insensitive and trimmed.
 * @param {string} email
 * @returns {boolean}
 */
export function isSuperAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  const cleanEmail = email.trim().toLowerCase();
  const superAdminEmails = getSuperAdminEmails();
  return (
    superAdminEmails.includes(cleanEmail) ||
    cleanEmail === "superadmin@pabe.or.id" ||
    cleanEmail === "superadmin@pabe.user"
  );
}

/**
 * Checks whether an identifier (username or email) belongs to Super Admin.
 * @param {string} identifier
 * @returns {boolean}
 */
export function isSuperAdminIdentifier(identifier) {
  if (!identifier || typeof identifier !== "string") return false;
  const clean = identifier.trim().toLowerCase();
  return (
    clean === "superadmin" ||
    clean === "superadmin@pabe.or.id" ||
    clean === "superadmin@pabe.user" ||
    isSuperAdminEmail(clean)
  );
}

/**
 * Creates a salted scrypt hash of a password.
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored salt:hash string using timingSafeEqual.
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Extracts and verifies the current authenticated user from request cookies.
 * Supports NextRequest, standard WHATWG Request headers, and Next.js cookies() store.
 * @param {Request} [request]
 * @returns {Promise<{ authenticated: boolean, user: object|null, reason?: string }>}
 */
export async function getAuthenticatedUser(request) {
  let sessionId = null;

  // 1. NextRequest helper (.cookies.get)
  if (request?.cookies && typeof request.cookies.get === "function") {
    sessionId = request.cookies.get("pabe_session")?.value;
  }

  // 2. Fallback: Parse raw Request header 'cookie'
  if (!sessionId && request?.headers) {
    const cookieHeader =
      typeof request.headers.get === "function"
        ? request.headers.get("cookie") || ""
        : request.headers?.cookie || "";
    if (cookieHeader) {
      const match = cookieHeader.match(/pabe_session=([^;]+)/);
      sessionId = match ? decodeURIComponent(match[1].trim()) : null;
    }
  }

  // 3. Fallback: Official Next.js cookies() store from next/headers
  if (!sessionId) {
    try {
      const cookieStore = await cookies();
      sessionId = cookieStore.get("pabe_session")?.value;
    } catch {
      // Ignored if executed outside server context
    }
  }

  // 4. Fallback: Request headers 'x-pabe-session' or 'authorization'
  if (!sessionId && request?.headers) {
    const authHeader =
      (typeof request.headers.get === "function" ? request.headers.get("x-pabe-session") : null) ||
      (typeof request.headers.get === "function" ? request.headers.get("authorization") : null);
    if (authHeader) {
      sessionId = decodeURIComponent(authHeader.replace(/^Bearer\s+/i, "").trim());
    }
  }

  // Sanitize sessionId value
  if (sessionId) {
    sessionId = String(sessionId).replace(/^["']|["']$/g, "").trim();
  }

  // Graceful recovery jika sesi client sebelumnya tercemar dummy USR-DONOR
  if (sessionId === "USR-DONOR" && request) {
    try {
      const u = new URL(request.url);
      const emailParam = u.searchParams.get("email");
      if (emailParam) {
        sessionId = emailParam.trim();
      }
    } catch {}
  }

  if (!sessionId) {
    return { authenticated: false, user: null, reason: "NO_SESSION_COOKIE" };
  }

  // 5. Validasi Kriptografis Token Sesi (HMAC-SHA256 Anti-Forgery)
  let verifiedUserId = null;
  let verifiedEmail = null;
  if (isSignedSessionTokenFormat(sessionId)) {
    const verified = verifySessionToken(sessionId);
    if (verified?.id) {
      verifiedUserId = verified.id;
      verifiedEmail = verified.email || null;
    } else {
      return { authenticated: false, user: null, reason: "INVALID_SESSION_SIGNATURE" };
    }
  } else if (process.env.NODE_ENV === "production") {
    // Pada lingkungan produksi, tolak seluruh format sesi unsigned/plain-text
    return { authenticated: false, user: null, reason: "UNSIGNED_SESSION_REJECTED" };
  }

  const lookupId = verifiedUserId || sessionId;

  try {
    let user = null;
    let lastDbError = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: lookupId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          title: true,
          avatar: true,
          customAvatar: true,
          providerAvatar: true,
          phone: true,
          city: true,
          address: true,
          provider: true,
          createdAt: true,
        },
      });

      // Fallback: Jika lookup by id gagal namun token memiliki email terverifikasi (HMAC-SHA256),
      // cari akun berdasarkan email tersebut (menangani id token OAuth USR-GGL/USR-FB)
      if (!user && verifiedEmail) {
        user = await prisma.user.findUnique({
          where: { email: verifiedEmail.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            title: true,
            avatar: true,
            customAvatar: true,
            providerAvatar: true,
            phone: true,
            city: true,
            address: true,
            provider: true,
            createdAt: true,
          },
        });
      }
      if (!user && !verifiedUserId) {
        // Fallback pencarian fleksibel hanya untuk mode dev/test
        const cleanProviderId = lookupId.replace(/^USR-(?:GGL|FB)-/, "");
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: lookupId },
              { username: lookupId },
              { providerId: lookupId },
              { providerId: cleanProviderId },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
            title: true,
            avatar: true,
            customAvatar: true,
            providerAvatar: true,
            phone: true,
            city: true,
            address: true,
            provider: true,
            createdAt: true,
          },
        });
      }
    } catch (dbErr) {
      console.warn("serverAuth prisma user lookup warning:", dbErr?.message);
    }

    if (user) {
      if (user.isActive === false) {
        return { authenticated: false, user: null, reason: "ACCOUNT_SUSPENDED" };
      }

      let resolvedRole = user.role;
      let resolvedTitle = user.title;

      if (
        (isSuperAdminIdentifier(user.username) || isSuperAdminEmail(user.email)) &&
        user.role !== USER_ROLES.SUPER_ADMIN
      ) {
        resolvedRole = USER_ROLES.SUPER_ADMIN;
        resolvedTitle = "Super Admin";
        prisma.user
          .update({
            where: { id: user.id },
            data: { role: resolvedRole, title: resolvedTitle },
          })
          .catch((err) => console.warn("Auto-elevate super admin update error:", err?.message));
      }

      if (resolvedTitle && resolvedTitle.includes("Ketua Yayasan")) {
        resolvedTitle = "Super Admin";
      }

      return {
        authenticated: true,
        user: {
          ...user,
          role: resolvedRole,
          title: resolvedTitle,
          initials: getInitials(user.name, user.email),
        },
      };
    }

    // Check demo users fallback
    const lookupTarget = lookupId || sessionId;
    const demoMatch = DEMO_USERS.find(
      (u) =>
        u.id === lookupTarget ||
        (u.email &&
          (u.email.toLowerCase() === lookupTarget.toLowerCase() ||
            (verifiedEmail && u.email.toLowerCase() === verifiedEmail.toLowerCase()))) ||
        (u.username && u.username.toLowerCase() === lookupTarget.toLowerCase())
    );

    if (demoMatch) {
      return {
        authenticated: true,
        user: {
          id: demoMatch.id,
          name: demoMatch.name,
          email: demoMatch.email,
          username: demoMatch.username,
          role: demoMatch.role,
          title: demoMatch.title,
          avatar: demoMatch.avatar,
          phone: demoMatch.phone,
          provider: "demo",
          initials: demoMatch.initials,
        },
      };
    }

    return { authenticated: false, user: null, reason: "USER_NOT_FOUND" };
  } catch (error) {
    console.error("serverAuth getAuthenticatedUser error:", error);
    return { authenticated: false, user: null, reason: "DATABASE_ERROR" };
  }
}

/**
 * Enforces authentication and optional role-based access control.
 * Returns either { user, errorResponse: null } or { user: null, errorResponse: NextResponse }.
 * @param {Request} request
 * @param {string[]} [allowedRoles]
 * @returns {Promise<{ user: object|null, errorResponse: NextResponse|null }>}
 */
export async function requireAuth(request, allowedRoles = []) {
  const { authenticated, user, reason } = await getAuthenticatedUser(request);

  if (!authenticated || !user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Akses tidak sah. Silakan masuk terlebih dahulu.",
          code: reason || "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki izin untuk mengakses sumber daya ini.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
