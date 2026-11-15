import { getAuthenticatedUser } from "@/lib/serverAuth";
import { verifyInvoiceToken, isWeakDeterministicToken } from "@/lib/invoiceAccess";

/**
 * Mengekstrak kandidat token akses invoice dari request (cookie, query, header, atau body).
 * @param {Request} request
 * @param {string} invoiceId
 * @param {string|null} [explicitToken]
 * @returns {string|null}
 */
export function extractInvoiceTokenFromRequest(request, invoiceId, explicitToken = null) {
  if (explicitToken && typeof explicitToken === "string" && explicitToken.trim()) {
    return explicitToken.trim();
  }

  if (!request) return null;

  const cookieName = `pabe_inv_${invoiceId}`;

  // 1. NextRequest .cookies.get
  if (request.cookies && typeof request.cookies.get === "function") {
    const val = request.cookies.get(cookieName)?.value;
    if (val) return val.trim();
  }

  // 2. Raw Cookie header fallback
  if (request.headers && typeof request.headers.get === "function") {
    const cookieHeader = request.headers.get("cookie") || "";
    if (cookieHeader && invoiceId) {
      const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
      if (match?.[1]) {
        return decodeURIComponent(match[1].trim());
      }
    }

    const headerToken = request.headers.get("x-invoice-token");
    if (headerToken) return headerToken.trim();
  }

  // 3. Query string ?token=
  if (request.url) {
    try {
      const u = new URL(request.url);
      const qToken = u.searchParams.get("token");
      if (qToken) return qToken.trim();
    } catch {}
  }

  return null;
}

/**
 * Memeriksa apakah pemanggil request berwenang mengakses atau memodifikasi invoice donasi.
 * Mendukung 3 jalur sah:
 * 1. Token akses invoice kriptografis yang valid (bukan token deterministik lemah)
 * 2. Sesi pengguna terautentikasi dengan email yang cocok dengan donorEmail
 * 3. Sesi staf internal yayasan (role !== DONOR)
 *
 * @param {object} params
 * @param {Request} [params.request]
 * @param {object} params.donation - Record donasi dari database
 * @param {string|null} [params.providedToken]
 * @param {object|null} [params.sessionUser]
 * @returns {Promise<{ authorized: boolean, isOwner: boolean, isStaff: boolean, hasValidToken: boolean }>}
 */
export async function verifyDonationOwnership({
  request = null,
  donation,
  providedToken = null,
  sessionUser = null,
}) {
  if (!donation) {
    return { authorized: false, isOwner: false, isStaff: false, hasValidToken: false };
  }

  let effectiveUser = sessionUser;
  if (!effectiveUser && request) {
    const authState = await getAuthenticatedUser(request);
    effectiveUser = authState?.user || null;
  }

  const candidateToken = extractInvoiceTokenFromRequest(
    request,
    donation.invoiceId,
    providedToken
  );

  const storedToken = donation.accessToken;
  const isStoredTokenSafe =
    Boolean(storedToken) && !isWeakDeterministicToken(donation.invoiceId, storedToken);

  const hasValidToken =
    isStoredTokenSafe && verifyInvoiceToken(candidateToken, storedToken);

  const userEmail = effectiveUser?.email ? effectiveUser.email.trim().toLowerCase() : "";
  const donationEmail = donation.donorEmail ? donation.donorEmail.trim().toLowerCase() : "";
  const emailMatches = Boolean(userEmail && donationEmail && userEmail === donationEmail);

  const userPhone = effectiveUser?.phone ? effectiveUser.phone.trim().replace(/[^0-9]/g, "") : "";
  const donationPhone = donation.donorPhone ? donation.donorPhone.trim().replace(/[^0-9]/g, "") : "";
  let phoneMatches = false;
  if (userPhone && donationPhone && userPhone.length >= 9 && donationPhone.length >= 9) {
    const normUser = userPhone.startsWith("62") ? "0" + userPhone.slice(2) : userPhone;
    const normDonation = donationPhone.startsWith("62") ? "0" + donationPhone.slice(2) : donationPhone;
    phoneMatches = normUser === normDonation;
  }

  const isOwner = Boolean(emailMatches || phoneMatches);

  const isStaff = Boolean(effectiveUser?.role && effectiveUser.role !== "DONOR");

  return {
    authorized: Boolean(hasValidToken || isOwner || isStaff),
    isOwner,
    isStaff,
    hasValidToken,
  };
}

