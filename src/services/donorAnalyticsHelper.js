/**
 * Helper transformasi dan kalkulasi analitik dashboard donatur
 */

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export function getDefaultMonthlyTrend() {
  return MONTH_NAMES.map((m) => ({ month: m, donasi: 0 }));
}

export function calculateMonthlyTrend(donationsInYear) {
  const monthlyMap = {};
  for (let i = 0; i < 12; i++) monthlyMap[i] = 0;

  donationsInYear.forEach((d) => {
    const dateObj = d.paidAt || d.createdAt;
    if (dateObj) {
      const m = new Date(dateObj).getMonth();
      if (m >= 0 && m < 12) {
        monthlyMap[m] += d.amount;
      }
    }
  });

  return MONTH_NAMES.map((m, idx) => ({
    month: m,
    donasi: monthlyMap[idx],
  }));
}

export function calculateCategoryDistribution(allUserDonations, totalNominal) {
  const catMap = {};
  allUserDonations.forEach((d) => {
    let catName = d.campaign?.category?.name || "";
    if (!catName || catName.toUpperCase().includes("ZISWAF")) {
      if (d.donationType === "ZAKAT") catName = "Zakat Maal & Fitrah";
      else if (d.donationType === "INFAK_SUBUH") catName = "Sedekah Subuh";
      else if (d.donationType === "WAKAF") catName = "Wakaf Produktif";
      else catName = "Program Kemanusiaan";
    }
    catMap[catName] = (catMap[catName] || 0) + d.amount;
  });

  return Object.entries(catMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalNominal > 0 ? Math.round((value / totalNominal) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function formatRecentDonations(recentDonationsData) {
  return (recentDonationsData || []).map((d, index) => {
    const effectiveProgramTitle =
      d.campaign?.title ||
      (d.donationType === "ZAKAT"
        ? "Zakat Maal & Fitrah"
        : d.donationType === "INFAK_SUBUH"
        ? "Sedekah Subuh"
        : d.donationType === "WAKAF"
        ? "Wakaf Produktif"
        : "Program Kemanusiaan");

    return {
      id: d.id,
      no: index + 1,
      invoiceId: d.invoiceId,
      donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
      amount: d.amount,
      programTitle: effectiveProgramTitle,
      campaignSlug: d.campaign?.slug || "",
      paymentChannel: d.paymentChannel || "QRIS",
      date: (d.paidAt || d.createdAt).toISOString(),
      status: d.status,
    };
  });
}

export function formatRecentReports(recentReportsData) {
  return (recentReportsData || []).map((rep) => ({
    id: rep.id,
    title: rep.title,
    content: rep.content,
    disbursedAmount: rep.disbursedAmount,
    date: rep.date.toISOString(),
    categoryName: rep.campaign?.category?.name || "Program Kebaikan",
    campaignTitle: rep.campaign?.title || "",
    campaignSlug: rep.campaign?.slug || "",
  }));
}

export function formatRoutineDonations(routineDonationsData) {
  return (routineDonationsData || []).map((r) => ({
    id: r.id,
    programTitle: r.campaign?.title || r.programTitle || "Program Kebaikan Rutin",
    amount: r.amount,
    frequency: r.frequency,
    routineType: r.routineType,
    status: r.status,
    reminderTime: r.reminderTime || "05:00",
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Filter kepemilikan donatur terpusat (Anti-IDOR & Zero Trust).
 * Menghubungkan donasi via email terdaftar dan/atau nomor telepon (WhatsApp),
 * sehingga donasi tamu maupun donasi anonim tetap dapat diakses di dashboard pribadi pemiliknya.
 */
export function buildUserWhereClause(userEmail, userName, userPhone) {
  const normalizedEmail = typeof userEmail === "string" ? userEmail.trim() : "";
  const normalizedPhone = typeof userPhone === "string" ? userPhone.trim().replace(/[^0-9]/g, "") : "";
  const normalizedName = typeof userName === "string" ? userName.trim() : "";

  const identityConditions = [];

  if (normalizedEmail) {
    identityConditions.push({ donorEmail: { equals: normalizedEmail, mode: "insensitive" } });
  }

  if (normalizedPhone && normalizedPhone.length >= 9) {
    const localPhone = normalizedPhone.startsWith("62") ? "0" + normalizedPhone.slice(2) : normalizedPhone;
    const intlPhone = normalizedPhone.startsWith("0") ? "62" + normalizedPhone.slice(1) : normalizedPhone;
    identityConditions.push(
      { donorPhone: localPhone },
      { donorPhone: intlPhone }
    );
  }

  if (identityConditions.length > 0) {
    return identityConditions.length === 1 ? identityConditions[0] : { OR: identityConditions };
  }

  if (normalizedName) {
    const withoutHonorific = normalizedName.replace(/^(H\.|Hj\.|Drs\.|Ust\.|dr\.|Prof\.)\s*/i, "").trim();
    if (withoutHonorific && withoutHonorific !== normalizedName) {
      return {
        OR: [
          { donorName: { equals: normalizedName, mode: "insensitive" } },
          { donorName: { contains: withoutHonorific, mode: "insensitive" } },
        ],
      };
    }
    return { donorName: { equals: normalizedName, mode: "insensitive" } };
  }

  return null;
}

