import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  sanitizeInput,
  sanitizeName,
  sanitizeCity,
  sanitizePhone,
  sanitizeBio,
  sanitizeAddress,
  sanitizeBankAccount,
  sanitizeBankAccountName,
  sanitizeImageUrl,
  validateName,
  validatePhone,
  validateBankAccount,
  validatePasswordInput,
} from "@/lib/security";
import { DEMO_USERS } from "@/services/authService";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
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

export async function getDonorProfile({ userEmail, userId }) {
  if (!userEmail && !userId) {
    throw new Error("Identitas pengguna tidak ditemukan.");
  }

  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userEmail ? [{ email: userEmail.trim().toLowerCase() }] : []),
          ...(userId ? [{ id: userId }] : []),
        ],
      },
    });

    if (!user && userEmail) {
      const demoMatch = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === userEmail.trim().toLowerCase()
      );

      if (demoMatch) {
        user = await prisma.user.create({
          data: {
            id: demoMatch.id,
            name: demoMatch.name,
            email: demoMatch.email,
            username: demoMatch.username,
            role: demoMatch.role,
            title: demoMatch.title,
            phone: demoMatch.phone,
            avatar: demoMatch.avatar,
            salutation: "",
            bio: "Mewujudkan generasi qur'ani mandiri dan berdaya saing.",
            city: "Bandung",
            address: "Jl. Riau No. 45, Bandung, Jawa Barat",
            coverImage:
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
            bankName: "BSI (Bank Syariah Indonesia)",
            bankAccount: "7123456789",
            bankAccountName: "Hendra Wijaya",
          },
        });
      }
    }

    if (!user) {
      throw new Error("Pengguna tidak ditemukan di database.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      title: user.title || "Donatur",
      salutation: user.salutation || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      bio: user.bio || "",
      city: user.city || "",
      address: user.address || "",
      coverImage: user.coverImage || "",
      bankName: user.bankName || "",
      bankAccount: user.bankAccount || "",
      bankAccountName: user.bankAccountName || "",
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error getDonorProfile in donorProfileService:", error);
    throw error;
  }
}

export async function updateDonorProfile({ userEmail, profileData }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  const updatePayload = {};

  if (profileData.name !== undefined) {
    const cleanName = sanitizeName(profileData.name).trim();
    const nameValidation = validateName(cleanName);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }
    updatePayload.name = cleanName;
  }

  if (profileData.bio !== undefined) {
    updatePayload.bio = sanitizeBio(profileData.bio).trim();
  }

  if (profileData.city !== undefined) {
    updatePayload.city = sanitizeCity(profileData.city).trim();
  }

  if (profileData.address !== undefined) {
    updatePayload.address = sanitizeAddress(profileData.address).trim();
  }

  if (profileData.phone !== undefined) {
    const cleanPhone = sanitizePhone(profileData.phone).trim();
    if (cleanPhone) {
      const phoneValidation = validatePhone(cleanPhone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }
    }
    updatePayload.phone = cleanPhone;
  }

  if (profileData.bankName !== undefined) {
    updatePayload.bankName = sanitizeInput(profileData.bankName).trim();
  }
  if (profileData.bankAccount !== undefined) {
    updatePayload.bankAccount = sanitizeBankAccount(profileData.bankAccount).trim();
  }
  if (profileData.bankAccountName !== undefined) {
    updatePayload.bankAccountName = sanitizeBankAccountName(profileData.bankAccountName).trim();
  }

  if (
    updatePayload.bankAccount !== undefined ||
    updatePayload.bankAccountName !== undefined
  ) {
    const bankValidation = validateBankAccount({
      bankAccount: updatePayload.bankAccount,
      bankAccountName: updatePayload.bankAccountName,
    });
    if (!bankValidation.isValid) {
      throw new Error(bankValidation.message);
    }
  }

  if (profileData.coverImage !== undefined) {
    updatePayload.coverImage = sanitizeImageUrl(profileData.coverImage);
  }
  if (profileData.avatar !== undefined) {
    updatePayload.avatar = sanitizeImageUrl(profileData.avatar);
  }

  try {
    const updated = await prisma.user.update({
      where: { email: cleanEmail },
      data: updatePayload,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      role: updated.role,
      title: updated.title,
      salutation: "",
      phone: updated.phone || "",
      avatar: updated.avatar || "",
      bio: updated.bio || "",
      city: updated.city || "",
      address: updated.address || "",
      coverImage: updated.coverImage || "",
      bankName: updated.bankName || "",
      bankAccount: updated.bankAccount || "",
      bankAccountName: updated.bankAccountName || "",
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error updateDonorProfile in donorProfileService:", error);
    throw error;
  }
}

export async function updateDonorPassword({ userEmail, oldPassword, newPassword }) {
  if (!userEmail) {
    throw new Error("Email pengguna diperlukan.");
  }

  const newPassValidation = validatePasswordInput(newPassword, "Kata sandi baru");
  if (!newPassValidation.isValid) {
    throw new Error(newPassValidation.message);
  }

  const cleanEmail = userEmail.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new Error("Pengguna tidak ditemukan.");
  }

  if (user.passwordHash) {
    if (!oldPassword || !oldPassword.trim()) {
      throw new Error("Kata sandi saat ini wajib diisi untuk verifikasi keamanan.");
    }
    const isValid = verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Kata sandi saat ini tidak cocok.");
    }
  }

  if (oldPassword && oldPassword === newPassword) {
    throw new Error("Kata sandi baru harus berbeda dari kata sandi saat ini.");
  }

  const newHash = hashPassword(newPassword);

  await prisma.user.update({
    where: { email: cleanEmail },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
