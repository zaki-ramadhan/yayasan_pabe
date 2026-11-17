import { NextResponse } from "next/server";
import { getDonorProfile, updateDonorProfile, anonymizeDonorAccount } from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email");
    const requestedId = searchParams.get("id");

    const canInspectOthers = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(authUser.role);
    const targetEmail = (canInspectOthers && requestedEmail) ? requestedEmail : authUser.email;
    const targetId = (canInspectOthers && requestedId) ? requestedId : authUser.id;

    const data = await getDonorProfile({ userEmail: targetEmail, userId: targetId });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API GET /api/user/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat profil pengguna.",
      },
      { status: 404 }
    );
  }
}

export async function PUT(request) {
  const rateLimitResponse = checkRateLimit(request, {
    action: "update_profile",
    limit: 20,
    windowMs: 60000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { profileData } = body;

    if (!profileData || typeof profileData !== "object" || Array.isArray(profileData)) {
      return NextResponse.json(
        {
          success: false,
          message: "Data profil tidak valid.",
        },
        { status: 400 }
      );
    }

    const ALLOWED_FIELDS = [
      "name",
      "city",
      "address",
      "phone",
      "avatar",
      "customAvatar",
    ];

    const safeProfileData = {};
    for (const key of ALLOWED_FIELDS) {
      if (profileData[key] !== undefined) {
        safeProfileData[key] = profileData[key];
      }
    }

    const updatedUser = await updateDonorProfile({
      userEmail: authUser.email,
      profileData: safeProfileData,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profil pengguna berhasil diperbarui.",
    });
  } catch (error) {
    console.error("API PUT /api/user/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui profil pengguna.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const rateLimitResponse = checkRateLimit(request, {
    action: "anonymize_profile",
    limit: 5,
    windowMs: 60000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const result = await anonymizeDonorAccount({
      userId: authUser.id,
      userEmail: authUser.email,
    });

    const response = NextResponse.json({
      success: true,
      message: result.message || "Akun Anda berhasil dihapus.",
    });

    response.cookies.delete("pabe_session");
    response.cookies.delete("pabe_role");

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses permohonan anonimisasi akun.",
      },
      { status: 400 }
    );
  }
}
