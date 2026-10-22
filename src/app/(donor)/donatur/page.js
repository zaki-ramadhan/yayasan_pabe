import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DonaturRootPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("pabe_role")?.value || cookieStore.get("ygsm_role")?.value;
  if (role && role !== "DONOR") {
    redirect("/admin");
  }
  redirect("/donatur/dashboard");
}
