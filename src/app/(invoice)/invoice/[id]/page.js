import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { getDonationByInvoiceId } from "@/services/donationService";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { InvoiceDisplay } from "@/components/modules/InvoiceDisplay";
import { ASSET_PATHS } from "@/lib/assetConstants";

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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Brand Header Sederhana */}
      <div className="pb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 select-none focus:outline-none group"
          aria-label="Kembali ke Beranda Yayasan Payung Berkah"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
            <Image
              src={ASSET_PATHS.BRANDING.LOGO}
              alt="Logo Yayasan Payung Berkah"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight group-hover:text-primary transition-colors">
            Yayasan Payung Berkah
          </span>
        </Link>
      </div>

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
