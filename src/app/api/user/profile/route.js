import { NextResponse } from "next/server";
import { getDonorProfile, updateDonorProfile } from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export async function GET(request) {
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email");
    const requestedId = searchParams.get("id");

    // Only internal admins can inspect other users; normal users can only access their own profile
    const isAdmin = authUser.role && authUser.role !== USER_ROLES.DONOR;
    const targetEmail = (isAdmin && requestedEmail) ? requestedEmail : authUser.email;
    const targetId = (isAdmin && requestedId) ? requestedId : authUser.id;

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
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { profileData } = body;

    if (!profileData || typeof profileData !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Data profil tidak valid.",
        },
        { status: 400 }
      );
    }

    // Always scope to the authenticated user's email (Anti-IDOR)
    const updatedUser = await updateDonorProfile({
      userEmail: authUser.email,
      profileData,
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
      { status: 500 }
    );
  }
}
