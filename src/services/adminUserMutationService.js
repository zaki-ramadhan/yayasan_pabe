import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { sanitizeEmail, sanitizePhoneInput, sanitizeText } from "@/lib/userParser";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { validatePhone } from "@/lib/validator";

export const STAFF_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.FINANCE,
  USER_ROLES.VOLUNTEER,
];

/**
 * Mendaftarkan pengurus baru yayasan oleh Super Admin.
 */
export async function createAdminUser({
  name,
  email,
  phone = "",
  role = USER_ROLES.ADMIN,
  title = "",
  password = "",
}) {
  const cleanName = sanitizeText(name);
  if (!cleanName) {
    throw new Error("Nama lengkap pengurus wajib diisi.");
  }

  const emailVal = await verifyEmailDomainDns(email, { isRequired: true });
  if (!emailVal.isValid) {
    throw new Error(emailVal.message || "Format alamat email tidak valid.");
  }
  const cleanEmail = emailVal.sanitized;
  let cleanPhone = null;
  if (phone) {
    const phoneVal = validatePhone(phone, { isRequired: false, fieldName: "Nomor telepon" });
    if (!phoneVal.isValid) {
      throw new Error(phoneVal.message);
    }
    cleanPhone = phoneVal.sanitized;
  }
  const cleanTitle = sanitizeText(title) || (role === USER_ROLES.ADMIN ? "Admin Operasional" : role);

  if (!STAFF_ROLES.includes(role)) {
    throw new Error("Role pengurus yang dipilih tidak valid.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existing) {
    throw new Error("Alamat email sudah terdaftar di sistem.");
  }

  const tempPassword = password || `Pabe-${crypto.randomBytes(3).toString("hex")}!`;
  const passwordHash = hashPassword(tempPassword);

  const newUser = await prisma.user.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      title: cleanTitle,
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
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    user: newUser,
    generatedPassword: tempPassword,
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

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: cleanName,
      phone: cleanPhone,
      title: cleanTitle,
      role: nextRole,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      phone: true,
      isActive: true,
      updatedAt: true,
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

  return prisma.user.delete({
    where: { id },
  });
}
