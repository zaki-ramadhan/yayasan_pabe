import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { DEMO_USERS } from "@/services/authService";
import { sanitizeText } from "@/lib/userParser";
import {
  STAFF_ROLES,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  resetAdminUserPassword,
  deleteAdminUser,
} from "./adminUserMutationService";

export {
  STAFF_ROLES,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  resetAdminUserPassword,
  deleteAdminUser,
};

/**
 * Mengambil daftar pengurus yayasan dengan paginasi dan filter.
 */
export async function getAdminUsers({
  search = "",
  role = "ALL",
  status = "ALL",
  page = 1,
  limit = 10,
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
  const skip = (safePage - 1) * safeLimit;

  try {
    const where = {
      role: role && role !== "ALL" ? role : { in: STAFF_ROLES },
    };

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "INACTIVE") {
      where.isActive = false;
    }

    if (search && search.trim()) {
      const cleanSearch = sanitizeText(search);
      where.OR = [
        { name: { contains: cleanSearch, mode: "insensitive" } },
        { email: { contains: cleanSearch, mode: "insensitive" } },
        { phone: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    const hasGenderField = Boolean(Prisma?.UserScalarFieldEnum?.gender);

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ role: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          title: true,
          avatar: true,
          salutation: true,
          ...(hasGenderField ? { gender: true } : {}),
          phone: true,
          isActive: true,
          passwordHash: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const formattedUsers = users.map((u) => {
      const isDemo = DEMO_USERS.some((d) => d.email.toLowerCase() === u.email.toLowerCase());
      const isInternalEmail = u.email.endsWith("@internal.yayasanpayungberkah.org");
      const hasLoginAccess = Boolean(u.passwordHash && !isInternalEmail);
      const gender =
        u.gender ||
        (u.salutation === "Ibu" || u.salutation === "Hj." || u.avatar?.includes("female")
          ? "FEMALE"
          : "MALE");
      return {
        ...u,
        passwordHash: undefined, // jangan ekspos hash ke client
        hasLoginAccess,
        isInternalEmail,
        gender,
        isDemo,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    });

    return {
      items: formattedUsers,
      users: formattedUsers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch (error) {
    console.warn("getAdminUsers database query fallback warning:", error?.message);
    const fallbackStaff = DEMO_USERS.filter((u) => STAFF_ROLES.includes(u.role)).map((u) => ({
      ...u,
      passwordHash: undefined,
      hasLoginAccess: true,
      isInternalEmail: false,
      gender: "MALE",
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return {
      items: fallbackStaff,
      users: fallbackStaff,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total: fallbackStaff.length,
        totalPages: 1,
      },
    };
  }
}
