import crypto from "crypto";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { sanitizeEmail, sanitizePhoneInput, sanitizeText } from "@/lib/userParser";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { validatePhone } from "@/lib/validator";
import { deleteFromR2 } from "@/lib/r2Storage";
import { anonymizeDonorAccount } from "@/services/donorProfileService";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";

export const STAFF_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.FINANCE,
  USER_ROLES.VOLUNTEER,
];

import { resolveStaffAvatar } from "@/constants/staffConstants";

/**
 * Mendaftarkan pengurus baru yayasan oleh Super Admin.
 * Mendukung mode tanpa akses login (hanya profil struktural publik)
 * maupun mode akun operasional dengan kredensial login dashboard.
 */
export async function createAdminUser({
  name,
  email = "",
  phone = "",
  role = USER_ROLES.ADMIN,
  title = "",
  gender = "MALE",
  password = "",
  hasLoginAccess = false,
}, actorUser = null) {
  const cleanName = sanitizeText(name);
  if (!cleanName) {
    throw new Error("Nama lengkap pengurus wajib diisi.");
  }

  const cleanTitle = sanitizeText(title) || (role === USER_ROLES.ADMIN ? "Admin Operasional" : role);
  if (!cleanTitle) {
    throw new Error("Jabatan struktural pengurus wajib diisi.");
  }

  let cleanEmail = null;
  const rawEmail = typeof email === "string" ? email.trim() : "";

  if (hasLoginAccess) {
    if (!rawEmail) {
      throw new Error("Alamat email login wajib diisi jika memberikan akses dashboard.");
    }
    const emailVal = await verifyEmailDomainDns(rawEmail, { isRequired: true });
    if (!emailVal.isValid) {
      throw new Error(emailVal.message || "Format alamat email tidak valid.");
    }
    cleanEmail = emailVal.sanitized;
  } else if (rawEmail) {
    const emailVal = await verifyEmailDomainDns(rawEmail, { isRequired: true });
    if (!emailVal.isValid) {
      throw new Error(emailVal.message || "Format alamat email tidak valid.");
    }
    cleanEmail = emailVal.sanitized;
  } else {
    // Generate internal placeholder email yang unik dan valid untuk schema database
    const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "pengurus";
    cleanEmail = `${nameSlug}.${crypto.randomBytes(4).toString("hex")}@internal.yayasanpayungberkah.org`;
  }

  let cleanPhone = null;
  if (phone) {
    const phoneVal = validatePhone(phone, { isRequired: false, fieldName: "Nomor telepon" });
    if (!phoneVal.isValid) {
      throw new Error(phoneVal.message);
    }
    cleanPhone = phoneVal.sanitized;
  }

  if (hasLoginAccess && role === USER_ROLES.SUPER_ADMIN) {
    if (!actorUser?.email || !isInfrastructureEmail(actorUser.email)) {
      throw new Error("Hanya Developer / Pemilik Sistem yang berwenang memberikan hak akses Super Admin.");
    }
  }

  const effectiveRole = hasLoginAccess
    ? (STAFF_ROLES.includes(role) ? role : USER_ROLES.ADMIN)
    : (STAFF_ROLES.includes(role) ? role : USER_ROLES.ADMIN);

  let passwordHash = null;
  let cleanPassword = "";

  if (hasLoginAccess) {
    cleanPassword = typeof password === "string" ? password.trim() : "";
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error("Kata sandi awal wajib diisi minimal 6 karakter untuk akses login.");
    }
    passwordHash = hashPassword(cleanPassword);
  }

  const cleanGender = gender === "FEMALE" || gender === "P" ? "FEMALE" : "MALE";
  const defaultAvatar = resolveStaffAvatar(null, cleanGender);

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error("Alamat email sudah terdaftar di sistem.");
  }

  const newUser = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: effectiveRole,
      title: cleanTitle,
      avatar: defaultAvatar,
      ...(Prisma?.UserScalarFieldEnum?.gender ? { gender: cleanGender } : {}),
      passwordHash,
      isActive: true,
      provider: "CREDENTIALS",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      avatar: true,
      phone: true,
      isActive: true,
      createdAt: true,
      ...(Prisma?.UserScalarFieldEnum?.gender ? { gender: true } : {}),
    },
  });

  return {
    user: newUser,
    generatedPassword: cleanPassword,
    hasLoginAccess,
  };
}

/**
 * Memperbarui data profil dan hak akses pengurus oleh Super Admin.
 */
export async function updateAdminUser(id, payload, actorUser) {
  if (!id) throw new Error("ID pengurus tidak valid.");

  const target = await prisma.user.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  // Anti-Lockout: Cek jika mencoba mendemosikan Super Admin
  if (target.role === USER_ROLES.SUPER_ADMIN && payload.role && payload.role !== USER_ROLES.SUPER_ADMIN) {
    if (actorUser?.id === target.id) {
      throw new Error("Anda tidak dapat menurunkan hak akses Super Admin akun Anda sendiri.");
    }
    const superAdminCount = await prisma.user.count({
      where: { role: USER_ROLES.SUPER_ADMIN, isActive: true },
    });
    if (superAdminCount <= 1) {
      throw new Error("Tidak dapat mengubah role Super Admin terakhir di yayasan.");
    }
  }

  const cleanName = payload.name ? sanitizeText(payload.name) : target.name;
  let cleanPhone = target.phone;
  if (payload.phone !== undefined) {
    if (payload.phone) {
      const phoneVal = validatePhone(payload.phone, { isRequired: false, fieldName: "Nomor telepon" });
      if (!phoneVal.isValid) {
        throw new Error(phoneVal.message);
      }
      cleanPhone = phoneVal.sanitized;
    } else {
      cleanPhone = null;
    }
  }
  const cleanTitle = payload.title !== undefined ? sanitizeText(payload.title) : target.title;
  const nextRole = payload.role && STAFF_ROLES.includes(payload.role) ? payload.role : target.role;

  // Proteksi: Hanya Developer / Pemilik Sistem yang berwenang menaikkan akun lain menjadi Super Admin
  if (nextRole === USER_ROLES.SUPER_ADMIN && target.role !== USER_ROLES.SUPER_ADMIN) {
    if (!actorUser?.email || !isInfrastructureEmail(actorUser.email)) {
      throw new Error("Hanya Developer / Pemilik Sistem yang berwenang menaikkan hak akses menjadi Super Admin.");
    }
  }

  let cleanGender = target.gender || "MALE";
  if (payload.gender !== undefined) {
    cleanGender = payload.gender === "FEMALE" || payload.gender === "P" ? "FEMALE" : "MALE";
  }

  let nextAvatar = target.avatar;
  const isDefaultAvatar =
    !target.avatar ||
    target.avatar === "/img/avatars/avatar-male.svg" ||
    target.avatar === "/img/avatars/avatar-female.svg";
  if (isDefaultAvatar) {
    nextAvatar = resolveStaffAvatar(null, cleanGender);
  }

  let cleanEmail = target.email;
  if (payload.email && payload.email.trim()) {
    const rawEmail = payload.email.trim();
    if (rawEmail.toLowerCase() !== target.email.toLowerCase() && !rawEmail.endsWith("@internal.yayasanpayungberkah.org")) {
      const emailVal = await verifyEmailDomainDns(rawEmail, { isRequired: true });
      if (!emailVal.isValid) {
        throw new Error(emailVal.message || "Format alamat email tidak valid.");
      }
      const existingEmail = await prisma.user.findFirst({
        where: { email: emailVal.sanitized, id: { not: id } },
      });
      if (existingEmail) {
        throw new Error("Alamat email sudah digunakan oleh pengguna lain.");
      }
      cleanEmail = emailVal.sanitized;
    }
  }

  let nextPasswordHash = target.passwordHash;
  if (payload.hasLoginAccess === false) {
    nextPasswordHash = null;
  } else if (payload.hasLoginAccess === true) {
    if (payload.password && payload.password.trim()) {
      const cleanPass = payload.password.trim();
      if (cleanPass.length < 6) {
        throw new Error("Kata sandi baru minimal 6 karakter.");
      }
      nextPasswordHash = hashPassword(cleanPass);
    } else if (!target.passwordHash) {
      throw new Error("Kata sandi awal wajib diisi saat mengaktifkan akses login.");
    }
    if (cleanEmail.endsWith("@internal.yayasanpayungberkah.org")) {
      throw new Error("Alamat email nyata wajib diisi untuk mengaktifkan akses login.");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      title: cleanTitle,
      role: nextRole,
      avatar: nextAvatar,
      passwordHash: nextPasswordHash,
      ...(Prisma?.UserScalarFieldEnum?.gender ? { gender: cleanGender } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      avatar: true,
      phone: true,
      isActive: true,
      updatedAt: true,
      ...(Prisma?.UserScalarFieldEnum?.gender ? { gender: true } : {}),
    },
  });

  return updated;
}

/**
 * Menangguhkan (suspend) atau mengaktifkan kembali akun pengurus.
 */
export async function toggleAdminUserStatus(id, actorUser) {
  if (!id) throw new Error("ID pengurus tidak valid.");

  if (actorUser?.id === id) {
    throw new Error("Anda tidak dapat menangguhkan akun Anda sendiri.");
  }

  const target = await prisma.user.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  // Anti-Lockout: Cek jika target adalah Super Admin terakhir
  if (target.role === USER_ROLES.SUPER_ADMIN && target.isActive) {
    const activeSuperAdminCount = await prisma.user.count({
      where: { role: USER_ROLES.SUPER_ADMIN, isActive: true },
    });
    if (activeSuperAdminCount <= 1) {
      throw new Error("Tidak dapat menonaktifkan Super Admin aktif terakhir.");
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive: !target.isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return updated;
}

/**
 * Me-reset password pengurus dan menghasilkan kata sandi sementara baru.
 */
export async function resetAdminUserPassword(id) {
  if (!id) throw new Error("ID pengurus tidak valid.");

  const target = await prisma.user.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  const tempPassword = `Pabe-${crypto.randomBytes(3).toString("hex")}!`;
  const passwordHash = hashPassword(tempPassword);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  return {
    temporaryPassword: tempPassword,
    userEmail: target.email,
    userName: target.name,
  };
}

/**
 * Menghapus akun pengurus dari sistem.
 */
export async function deleteAdminUser(id, actorUser) {
  if (!id) throw new Error("ID pengurus tidak valid.");

  if (actorUser?.id === id) {
    throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
  }

  const target = await prisma.user.findUnique({
    where: { id },
  });

  if (!target) {
    throw new Error("Data pengurus tidak ditemukan.");
  }

  if (target.role === USER_ROLES.SUPER_ADMIN) {
    const superAdminCount = await prisma.user.count({
      where: { role: USER_ROLES.SUPER_ADMIN },
    });
    if (superAdminCount <= 1) {
      throw new Error("Tidak dapat menghapus Super Admin terakhir.");
    }
  }

  // Jika target yang dihapus adalah akun donatur, jalankan anonimisasi PDP & pembatalan komitmen donasi rutin
  if (target.role === USER_ROLES.DONOR) {
    return anonymizeDonorAccount({ userId: target.id, userEmail: target.email });
  }

  // Jika target adalah pengurus/staf, batalkan donasi rutin aktif miliknya (jika ada) dan hapus avatar R2
  if (target.customAvatar && target.customAvatar.startsWith("/api/media/")) {
    try {
      await deleteFromR2(target.customAvatar);
    } catch (r2Err) {
      console.warn("Gagal menghapus avatar custom staf dari R2 saat hapus akun:", r2Err?.message);
    }
  }

  return prisma.$transaction(async (tx) => {
    // Batalkan jadwal komitmen donasi rutin yang mungkin pernah dibuat pengurus dengan email/nomor ponselnya
    if (target.email || target.phone) {
      await tx.routineDonation.updateMany({
        where: {
          OR: [
            ...(target.email ? [{ donorEmail: target.email }] : []),
            ...(target.phone ? [{ donorPhone: target.phone }] : []),
          ],
          status: { in: ["ACTIVE", "PAUSED"] },
        },
        data: {
          status: "CANCELLED",
        },
      });
    }

    // Catat audit trail aksi penghapusan pengurus oleh Super Admin
    await tx.activityLog.create({
      data: {
        userId: actorUser?.id || null,
        userName: actorUser?.name || "Super Admin",
        userRole: actorUser?.role || "SUPER_ADMIN",
        action: "DELETE_USER",
        targetType: "USER",
        targetId: target.id,
        description: `Akun pengurus "${target.name}" (${target.role}) berhasil dihapus oleh ${actorUser?.name || "Super Admin"}.`,
      },
    });

    return tx.user.delete({
      where: { id },
    });
  });
}
