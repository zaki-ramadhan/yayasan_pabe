import { NextResponse } from "next/server";
import {
  createDonation,
  getRecentDonations,
  updateDonationPrayer,
} from "@/services/donationService";
import { getCampaignDonationsPaginated } from "@/services/campaignService";
import {
  validateDonationAmount,
  validateName,
  validatePhone,
} from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignSlug = searchParams.get("campaignSlug");
    const limit = searchParams.get("limit")
      ? Math.min(parseInt(searchParams.get("limit"), 10) || 20, 100)
      : 20;
    const skip = searchParams.get("skip")
      ? Math.max(parseInt(searchParams.get("skip"), 10) || 0, 0)
      : 0;

    if (campaignSlug) {
      const result = await getCampaignDonationsPaginated({ campaignSlug, skip, limit });
      return NextResponse.json({ success: true, data: result });
    }

    const donations = await getRecentDonations(limit);
    return NextResponse.json({ success: true, data: donations });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data donasi." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donation_create",
      limit: 20,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();

    // 1. Enforce Server-Side Amount Validation
    const amountVal = validateDonationAmount(body.amount);
    if (!amountVal.isValid) {
      return NextResponse.json(
        { success: false, message: amountVal.message },
        { status: 400 }
      );
    }

    // 2. Validate Donor Name if not anonymous
    if (!body.isAnonymous) {
      const nameVal = validateName(body.donorName);
      if (!nameVal.isValid) {
        return NextResponse.json(
          { success: false, message: nameVal.message },
          { status: 400 }
        );
      }
    }

    // 3. Validate Phone if supplied
    if (body.donorPhone) {
      const phoneVal = validatePhone(body.donorPhone);
      if (!phoneVal.isValid) {
        return NextResponse.json(
          { success: false, message: phoneVal.message },
          { status: 400 }
        );
      }
    }

    const donation = await createDonation(body);
    const response = NextResponse.json({ success: true, data: donation }, { status: 201 });

    if (donation.accessToken && donation.invoiceId) {
      const invOpts = {
        path: "/",
        maxAge: 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
      };
      response.cookies.set(`pabe_inv_${donation.invoiceId}`, donation.accessToken, invOpts);
      response.cookies.set(`ygsm_inv_${donation.invoiceId}`, donation.accessToken, invOpts);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses donasi." },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { invoiceId, prayer, isAnonymous } = body;
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Nomor invoice diperlukan." },
        { status: 400 }
      );
    }
    const updated = await updateDonationPrayer({ invoiceId, prayer, isAnonymous });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui doa." },
      { status: 400 }
    );
  }
}

