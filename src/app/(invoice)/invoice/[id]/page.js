import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getDonationByInvoiceId } from "@/services/donationService";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { InvoiceDisplay } from "@/components/modules/InvoiceDisplay";
import { InvoiceHeader } from "@/components/invoice/InvoiceHeader";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Instruksi Pembayaran #${id}`,
    description: "Selesaikan pembayaran donasi Anda melalui QRIS atau Virtual Account Yayasan Payung Berkah.",
  };
}

export default async function InvoicePage({ params, searchParams }) {
  const { id } = await params;
  const { token } = (await searchParams) || {};

  const cookieStore = await cookies();
  const authState = await getAuthenticatedUser({ cookies: cookieStore });
  const sessionUser = authState?.user || null;

  const cookieToken = cookieStore.get(`pabe_inv_${id}`)?.value || null;

  if (!token && cookieToken) {
    redirect(`/invoice/${id}?token=${cookieToken}`);
  }

  const effectiveToken = token || cookieToken || null;
  const donation = await getDonationByInvoiceId(id, effectiveToken, sessionUser);

  if (!donation || !donation.isAuthorized) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
      {/* Brand Header & User Profile Navigation */}
      <InvoiceHeader initialUser={sessionUser} />

      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
          { label: "Instruksi Pembayaran" },
        ]}
      />

      <InvoiceDisplay donation={donation} />
    </main>
  );
}
