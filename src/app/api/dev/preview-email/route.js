import { buildDonationReceiptEmailHtml } from "@/templates/emails/donationReceiptEmailTemplate";
import { buildRoutineDonationInvoiceEmailHtml } from "@/templates/emails/routineDonationInvoiceEmailTemplate";
import { buildRoutineRolloverEmailHtml } from "@/templates/emails/routineRolloverEmailTemplate";
import { buildRoutineCompletionEmailHtml } from "@/templates/emails/routineCompletionEmailTemplate";
import { buildRoutinePausedDueToUnpaidEmailHtml } from "@/templates/emails/routinePausedDueToUnpaidEmailTemplate";
import { buildAccountActivationEmailHtml } from "@/templates/emails/accountActivationEmailTemplate";
import { buildPasswordResetEmailHtml } from "@/templates/emails/passwordResetEmailTemplate";
import { buildCareerApplicationEmailHtml } from "@/templates/emails/careerApplicationEmailTemplate";
import { buildCareerShortlistEmailHtml } from "@/templates/emails/careerShortlistEmailTemplate";
import { buildCareerRejectionEmailHtml } from "@/templates/emails/careerRejectionEmailTemplate";
import { buildVolunteerRegistrationEmailHtml } from "@/templates/emails/volunteerRegistrationEmailTemplate";
import { buildVolunteerApprovalEmailHtml } from "@/templates/emails/volunteerApprovalEmailTemplate";
import { buildVolunteerRejectionEmailHtml } from "@/templates/emails/volunteerRejectionEmailTemplate";

/**
 * Development-only visual preview handler untuk template email transaksional.
 * Hanya aktif pada environment development (process.env.NODE_ENV === "development").
 */
export async function GET(request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Akses ditolak. Fitur preview hanya tersedia pada mode development.", {
      status: 403,
    });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "receipt";

  let html = "";

  switch (type) {
    case "receipt_zakat":
      html = buildDonationReceiptEmailHtml({
        donorName: "H. Ahmad Fauzi",
        programTitle: "Zakat Maal (Harta & Tabungan)",
        amount: 2500000,
        invoiceId: "INV-ZAKAT-20261116-001",
        paidAt: new Date(),
        paymentChannelName: "BSI Virtual Account",
        prayer: "Semoga zakat ini membersihkan harta dan jiwa kami sekeluarga",
        actionUrl: "http://localhost:3000/invoice/INV-ZAKAT-20261116-001",
        donationType: "ZAKAT",
      });
      break;

    case "receipt_infaq":
      html = buildDonationReceiptEmailHtml({
        donorName: "Siti Rahmawati",
        programTitle: "Infaq Pendidikan Santri Yatim",
        amount: 150000,
        invoiceId: "INV-INFAQ-20261116-002",
        paidAt: new Date(),
        paymentChannelName: "qris",
        prayer: "Untuk kelancaran belajar adik-adik santri",
        actionUrl: "http://localhost:3000/invoice/INV-INFAQ-20261116-002",
        donationType: "INFAQ",
      });
      break;

    case "receipt_sedekah":
      html = buildDonationReceiptEmailHtml({
        donorName: "Budi Santoso",
        programTitle: "Sedekah Subuh Rutin",
        amount: 50000,
        invoiceId: "INV-SEDEKAH-20261116-003",
        paidAt: new Date(),
        paymentChannelName: "qris",
        prayer: "Bismillah berkah rezeki dan kesehatan keluarga",
        actionUrl: "http://localhost:3000/invoice/INV-SEDEKAH-20261116-003",
        donationType: "SEDEKAH",
      });
      break;

    case "receipt_wakaf":
      html = buildDonationReceiptEmailHtml({
        donorName: "Hj. Nurul Hidayah",
        programTitle: "Wakaf Produktif Fasilitas Komputer Anak Binaan",
        amount: 500000,
        invoiceId: "INV-WAKAF-20261116-004",
        paidAt: new Date(),
        paymentChannelName: "Mandiri Bill Payment",
        prayer: "Amal jariyah untuk kedua orang tua tercinta",
        actionUrl: "http://localhost:3000/invoice/INV-WAKAF-20261116-004",
        donationType: "WAKAF",
      });
      break;

    case "receipt":
    default:
      html = buildDonationReceiptEmailHtml({
        donorName: "Muhammad Zaki Pratama",
        programTitle: "Bantuan Kemanusiaan Tanggap Bencana",
        amount: 100000,
        invoiceId: "INV-20261116-9138-218921",
        paidAt: new Date(),
        paymentChannelName: "qris",
        prayer: "Semoga barokah dan meringankan beban para korban",
        actionUrl: "http://localhost:3000/invoice/INV-20261116-9138-218921",
        donationType: "CAMPAIGN",
      });
      break;

    case "routine_invoice":
      html = buildRoutineDonationInvoiceEmailHtml({
        donorName: "Zaki",
        programTitle: "Sedekah Subuh Rutin Yatim & Dhuafa",
        amount: 50000,
        frequencyText: "Setiap Pekan (Jumat)",
        invoiceId: "INV-ROUTINE-20261116-001",
        actionUrl: "http://localhost:3000/invoice/INV-ROUTINE-20261116-001",
        routineType: "AUTO_DONATION",
        paymentChannel: "qris",
      });
      break;

    case "routine_rollover":
      html = buildRoutineRolloverEmailHtml({
        donorName: "Zaki",
        oldProgramTitle: "Wakaf Komputer Angkatan 1",
        newProgramTitle: "Pengadaan Perpustakaan Digital Yatim",
        actionUrl: "http://localhost:3000/dashboard/donor/routine-donations",
      });
      break;

    case "routine_completion":
      html = buildRoutineCompletionEmailHtml({
        donorName: "Zaki",
        programTitle: "Renovasi Asrama Yatim Tahap 1",
        catalogUrl: "http://localhost:3000/campaigns",
      });
      break;

    case "routine_paused":
      html = buildRoutinePausedDueToUnpaidEmailHtml({
        donorName: "Zaki",
        programTitle: "Sedekah Beras Rutin",
        resumeUrl: "http://localhost:3000/dashboard/donor/routine-donations",
      });
      break;

    case "activation":
      html = buildAccountActivationEmailHtml({
        name: "Zaki",
        activationUrl: "http://localhost:3000/verifikasi-email?token=preview_token_123",
      });
      break;

    case "reset_password":
      html = buildPasswordResetEmailHtml({
        name: "Zaki",
        resetUrl: "http://localhost:3000/reset-password?token=preview_token_123",
      });
      break;

    case "career_app":
      html = buildCareerApplicationEmailHtml({
        name: "Zaki",
        position: "Fullstack Engineer",
        department: "Teknologi Informasi",
      });
      break;

    case "career_shortlist":
      html = buildCareerShortlistEmailHtml({
        name: "Zaki",
        position: "Fullstack Engineer",
        department: "Teknologi Informasi",
      });
      break;

    case "career_rejection":
      html = buildCareerRejectionEmailHtml({
        name: "Zaki",
        position: "Fullstack Engineer",
        department: "Teknologi Informasi",
      });
      break;

    case "volunteer_reg":
      html = buildVolunteerRegistrationEmailHtml({
        name: "Zaki",
        city: "Jakarta Selatan",
        interest: "Pendidikan & Dakwah",
        statusUrl: "http://localhost:3000/relawan",
      });
      break;

    case "volunteer_approval":
      html = buildVolunteerApprovalEmailHtml({
        name: "Zaki",
        volunteerId: "YPABE-202611-088",
        validationUrl: "http://localhost:3000/relawan/validasi/YPABE-202611-088",
      });
      break;

    case "volunteer_rejection":
      html = buildVolunteerRejectionEmailHtml({
        name: "Zaki",
        interest: "Relawan Lapangan",
      });
      break;
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

