import prisma from "@/lib/prisma";
import { isCampaignClosed } from "@/lib/formatters";

/**
 * Entitas default program umum yayasan jika seluruh kampanye spesifik telah selesai atau kosong.
 */
export const DEFAULT_GENERAL_PROGRAM = Object.freeze({
  id: null,
  title: "Program Kebaikan & Operasional Yayasan PABE",
  slug: "program-kebaikan-umum",
  isGeneral: true,
});

/**
 * Calculates a normalized funding ratio for prioritizing under-funded campaigns.
 * If targetAmount is null or 0 (evergreen), treat as baseline (ratio 0.5) to give
 * higher urgency to target-based campaigns with low fulfillment (< 0.5), but higher
 * priority than almost-complete campaigns (> 0.5).
 *
 * @param {object} campaign
 * @returns {number}
 */
export function calculateFundingRatio(campaign) {
  const collected = Number(campaign?.collectedAmount || 0);
  const target = Number(campaign?.targetAmount || 0);
  if (!target || target <= 0) return 0.5;
  return collected / target;
}

/**
 * Compares two campaigns by funding urgency (lower fulfillment first, then closer deadline).
 *
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
export function compareCampaignUrgency(a, b) {
  const ratioA = calculateFundingRatio(a);
  const ratioB = calculateFundingRatio(b);

  if (Math.abs(ratioA - ratioB) > 0.001) {
    return ratioA - ratioB; // Lower ratio first (paling membutuhkan dana)
  }

  // Jika rasio sama, dahulukan yang memiliki batas waktu terdekat
  if (a.endDate && b.endDate) {
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  }
  if (a.endDate && !b.endDate) return -1;
  if (!a.endDate && b.endDate) return 1;

  // Fallback ke yang lebih baru
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

/**
 * Selects the optimal rollover campaign candidate using a 2-tier hierarchy:
 * 1. Tier 1: Same category, active, not closed, lowest funding fulfillment.
 * 2. Tier 2: Any category, active, not closed (prioritizes featured or lowest fulfillment).
 *
 * @param {object} params
 * @param {string} params.currentCampaignId - ID of the closing/completed campaign
 * @param {string} [params.currentCategoryId] - Optional category ID of the closing campaign
 * @param {Date} [params.now=new Date()]
 * @param {object} [params.prismaClient=prisma]
 * @returns {Promise<object|null>} The selected campaign or null if no active campaigns exist
 */
export async function selectRolloverCampaign({
  currentCampaignId,
  currentCategoryId = null,
  now = new Date(),
  prismaClient = prisma,
  allowGeneralFallback = false,
}) {
  if (!currentCampaignId && !currentCategoryId) {
    return allowGeneralFallback ? DEFAULT_GENERAL_PROGRAM : null;
  }

  let categoryId = currentCategoryId;

  // Jika categoryId belum disediakan, ambil dari campaign saat ini
  if (!categoryId && currentCampaignId && typeof prismaClient?.campaign?.findUnique === "function") {
    const current = await prismaClient.campaign.findUnique({
      where: { id: currentCampaignId },
      select: { categoryId: true },
    });
    categoryId = current?.categoryId || null;
  }

  if (typeof prismaClient?.campaign?.findMany !== "function") {
    return allowGeneralFallback ? DEFAULT_GENERAL_PROGRAM : null;
  }

  // 1. Ambil kandidat kampanye berstatus ACTIVE (selain kampanye yang sedang ditutup)
  const candidatePool = await prismaClient.campaign.findMany({
    where: {
      status: "ACTIVE",
      id: currentCampaignId ? { not: currentCampaignId } : undefined,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      targetAmount: true,
      collectedAmount: true,
      endDate: true,
      isFeatured: true,
      createdAt: true,
    },
  });

  if (!candidatePool || candidatePool.length === 0) {
    return allowGeneralFallback ? DEFAULT_GENERAL_PROGRAM : null;
  }

  // Filter kandidat yang belum kedaluwarsa secara waktu (endDate)
  const openCandidates = candidatePool.filter((c) => !isCampaignClosed(c));
  if (openCandidates.length === 0) {
    return allowGeneralFallback ? DEFAULT_GENERAL_PROGRAM : null;
  }

  // Tier 1: Cari kandidat dalam kategori yang sama
  if (categoryId) {
    const sameCategoryCandidates = openCandidates.filter((c) => c.categoryId === categoryId);
    if (sameCategoryCandidates.length > 0) {
      sameCategoryCandidates.sort(compareCampaignUrgency);
      return sameCategoryCandidates[0];
    }
  }

  // Tier 2: Fallback ke seluruh kategori aktif
  // Prioritaskan program unggulan (isFeatured) jika ada, lalu sort berdasarkan urgensi
  const featured = openCandidates.filter((c) => c.isFeatured);
  const generalPool = featured.length > 0 ? featured : openCandidates;

  generalPool.sort(compareCampaignUrgency);
  return generalPool[0] || (allowGeneralFallback ? DEFAULT_GENERAL_PROGRAM : null);
}
