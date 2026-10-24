import prisma from "@/lib/prisma";
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
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const formattedUsers = users.map((u) => {
      const isDemo = DEMO_USERS.some((d) => d.email.toLowerCase() === u.email.toLowerCase());
      return {
        ...u,
        isDemo,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    });

    return {
      users: formattedUsers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  } catch (error) {
    console.error("Error getAdminUsers in adminUserService:", error);
    throw error;
  }
}
