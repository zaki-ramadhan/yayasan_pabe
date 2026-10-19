import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEMO_USERS, USER_ROLES } from "@/services/authService";

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
 * @param {Request} request
 * @returns {Promise<{ authenticated: boolean, user: object|null, reason?: string }>}
 */
export async function getAuthenticatedUser(request) {
  let sessionId = null;

  if (request && request.cookies) {
    if (typeof request.cookies.get === "function") {
      sessionId = request.cookies.get("pabe_session")?.value || request.cookies.get("ygsm_session")?.value;
    } else {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/(?:pabe_session|ygsm_session)=([^;]+)/);
      sessionId = match ? decodeURIComponent(match[1]) : null;
    }
  }

  if (!sessionId) {
    return { authenticated: false, user: null, reason: "NO_SESSION_COOKIE" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        title: true,
        avatar: true,
        phone: true,
        provider: true,
        createdAt: true,
      },
    });

    if (user) {
      return {
        authenticated: true,
        user: {
          ...user,
          initials: (user.name || user.email).slice(0, 2).toUpperCase(),
        },
      };
    }

    // Check demo users fallback
    const demoMatch = DEMO_USERS.find(
      (u) => u.id === sessionId || u.email.toLowerCase() === sessionId.toLowerCase()
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
