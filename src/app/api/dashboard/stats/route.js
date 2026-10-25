import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export async function GET(request) {
  // Enforce staff/admin roles only (Anti-Data Leak)
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.VOLUNTEER,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const [
      donationAgg,
      campaignList,
      recentDonations,
      volunteerList,
      volunteerCount,
      jobAppCount,
      recentJobApps,
    ] = await Promise.all([
      prisma.donation.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { category: true },
      }),
      prisma.donation.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          campaign: {
            select: { title: true, slug: true },
          },
        },
      }),
      prisma.volunteer.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.volunteer.count(),
      prisma.jobApplication.count().catch(() => 0),
      prisma.jobApplication
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { vacancy: { select: { title: true } } },
        })
        .catch(() => []),
    ]);

    const totalDonations = donationAgg._sum.amount ?? 0;
    const paidCount = donationAgg._count.id ?? 0;

    const formattedDonations = recentDonations.map((d) => ({
      id: d.invoiceId,
      donor: d.isAnonymous ? "Hamba Allah" : d.donorName,
      amount: d.amount,
      channel: (d.paymentChannel || "qris").toUpperCase(),
      date: d.createdAt.toISOString(),
      status: d.status,
      campaignTitle: d.campaign?.title || "Sedekah Umum PABE",
    }));

    const formattedVolunteers = volunteerList.map((v) => ({
      id: v.id,
      name: v.fullName,
      city: v.city,
      profession: v.interest,
      event: v.interest,
      status: v.status,
    }));

    const formattedCampaigns = campaignList.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      collectedAmount: c.collectedAmount,
      targetAmount: c.targetAmount,
      categoryName: c.category?.name || "Program Umum",
    }));

    const formattedJobApps = recentJobApps.map((app) => ({
      id: app.id,
      name: app.fullName,
      email: app.email,
      phone: app.phone,
      position: app.vacancy?.title || "Staff Yayasan",
      status: app.status,
      date: app.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalDonations,
        transactionCount: paidCount,
        activeCampaignsCount: campaignList.length,
        volunteerCount,
        jobApplicationCount: jobAppCount,
        recentTransactions: formattedDonations,
        volunteerApplicants: formattedVolunteers,
        jobApplications: formattedJobApps,
        campaigns: formattedCampaigns,
      },
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat statistik dashboard",
        data: {
          totalDonations: 0,
          transactionCount: 0,
          activeCampaignsCount: 0,
          volunteerCount: 0,
          jobApplicationCount: 0,
          recentTransactions: [],
          volunteerApplicants: [],
          jobApplications: [],
          campaigns: [],
        },
      },
      { status: 500 }
    );
  }
}
