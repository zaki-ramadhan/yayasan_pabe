import { redirect } from "next/navigation";

export default async function LegacyZisDonateRedirect({ params, searchParams }) {
  const { slug } = await params;
  const sParams = (await searchParams) || {};
  const qp = new URLSearchParams();
  for (const [key, val] of Object.entries(sParams)) {
    if (typeof val === "string" && val.length > 0) {
      qp.set(key, val);
    }
  }
  const qs = qp.toString();
  redirect(`/zis/${slug}/donasi${qs ? `?${qs}` : ""}`);
}
