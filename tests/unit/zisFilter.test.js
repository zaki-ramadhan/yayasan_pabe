import { describe, it, expect } from "vitest";
import {
  TRANSACTION_TABS,
  ZIS_LOCKED_CATEGORIES,
  ZIS_LOCKED_CATEGORY_IDS,
  ZIS_CAMPAIGN_WHERE,
  ZIS_DONATION_WHERE,
  buildDonationTypeWhere,
  isZisTransaction,
  getTransactionTypeLabel,
  isZisCategory,
  isZisCampaign,
  isLockedZisCategoryId,
  getCampaignDetailHref,
  getCampaignDonateHref,
} from "@/lib/zisFilter";

describe("zisFilter SSOT helpers", () => {
  it("membangun klausa Prisma where yang akurat untuk ZIS dan CAMPAIGN", () => {
    expect(buildDonationTypeWhere(TRANSACTION_TABS.ALL)).toEqual({});
    expect(buildDonationTypeWhere(TRANSACTION_TABS.ZIS)).toEqual(ZIS_DONATION_WHERE);
    expect(buildDonationTypeWhere("ZAKAT")).toEqual(ZIS_DONATION_WHERE);

    const campaignWhere = buildDonationTypeWhere(TRANSACTION_TABS.CAMPAIGN);
    expect(campaignWhere).toEqual({
      AND: [
        { donationType: { notIn: ["ZAKAT", "INFAK_SUBUH"] } },
        {
          OR: [
            { campaignId: null },
            { campaign: { NOT: ZIS_CAMPAIGN_WHERE } },
          ],
        },
      ],
    });
  });

  it("mengidentifikasi transaksi ZIS baik dari donationType maupun kategori program", () => {
    expect(isZisTransaction({ donationType: "ZAKAT" })).toBe(true);
    expect(isZisTransaction({ donationType: "INFAK_SUBUH" })).toBe(true);
    expect(
      isZisTransaction({
        donationType: "CAMPAIGN",
        campaignSlug: "sedekah-subuh",
        categorySlug: "zakat",
      })
    ).toBe(true);
    expect(
      isZisTransaction({
        donationType: "CAMPAIGN",
        campaign: { slug: "program-zis-unggulan", category: { slug: "zis" } },
      })
    ).toBe(true);

    expect(
      isZisTransaction({
        donationType: "CAMPAIGN",
        campaignSlug: "bimbel-pabe-smart",
        categorySlug: "pendidikan",
      })
    ).toBe(false);
  });

  it("memberikan label badge transaksi yang kontekstual", () => {
    expect(getTransactionTypeLabel({ donationType: "ZAKAT" })).toBe("Zakat");
    expect(getTransactionTypeLabel({ donationType: "INFAK_SUBUH" })).toBe("Sedekah Subuh");
    expect(
      getTransactionTypeLabel({
        donationType: "CAMPAIGN",
        categorySlug: "zakat",
      })
    ).toBe("Zakat");
    expect(
      getTransactionTypeLabel({
        donationType: "CAMPAIGN",
        categorySlug: "zis",
      })
    ).toBe("Program ZIS");
    expect(
      getTransactionTypeLabel({
        donationType: "CAMPAIGN",
        routineDonationId: "rtn-1",
      })
    ).toBe("Donasi Rutin");
    expect(getTransactionTypeLabel({ donationType: "CAMPAIGN" })).toBe("Donasi Program");
  });

  it("mengidentifikasi kategori dan program ZIS vs donasi umum secara presisi", () => {
    expect(ZIS_LOCKED_CATEGORIES.map((c) => c.name)).toEqual(["Zakat", "Infaq", "Sedekah"]);
    expect(ZIS_LOCKED_CATEGORY_IDS).toEqual(["zakat", "infaq", "sedekah"]);
    expect(isLockedZisCategoryId("zakat")).toBe(true);
    expect(isLockedZisCategoryId("infaq")).toBe(true);
    expect(isLockedZisCategoryId("sedekah")).toBe(true);
    expect(isLockedZisCategoryId("pendidikan")).toBe(false);

    expect(isZisCategory({ id: "zakat", slug: "zakat", name: "Zakat" })).toBe(true);
    expect(isZisCategory({ id: "infaq", slug: "infaq", name: "Infaq" })).toBe(true);
    expect(isZisCategory({ id: "sedekah", slug: "sedekah", name: "Sedekah" })).toBe(true);
    expect(isZisCategory({ id: "cat-1", slug: "zis", name: "Program ZIS" })).toBe(true);
    expect(isZisCategory({ id: "cat-2", slug: "pendidikan", name: "Pendidikan" })).toBe(false);

    expect(isZisCampaign({ slug: "zakat-maal", category: "Zakat" })).toBe(true);
    expect(isZisCampaign({ slug: "infaq-masjid", categoryId: "infaq", categorySlug: "infaq" })).toBe(true);
    expect(isZisCampaign({ slug: "sedekah-subuh", categorySlug: "sedekah" })).toBe(true);
    expect(isZisCampaign({ slug: "beasiswa-yatim", category: "Pendidikan", categorySlug: "pendidikan" })).toBe(false);

    expect(getTransactionTypeLabel({ donationType: "CAMPAIGN", categorySlug: "infaq" })).toBe("Infaq");
    expect(getTransactionTypeLabel({ donationType: "CAMPAIGN", categorySlug: "sedekah" })).toBe("Sedekah");
  });

  it("membangun URL kanonikal detail dan donasi sesuai kategori ZIS vs Program Donasi", () => {
    expect(getCampaignDetailHref({ slug: "zakat-maal", categorySlug: "zakat" })).toBe("/zis/zakat-maal");
    expect(getCampaignDetailHref({ slug: "bantu-yatim", categorySlug: "infaq" })).toBe("/zis/bantu-yatim");
    expect(getCampaignDetailHref({ slug: "sedekah-subuh", categorySlug: "sedekah" })).toBe("/zis/sedekah-subuh");
    expect(getCampaignDetailHref({ slug: "beasiswa-yatim", categorySlug: "pendidikan" })).toBe("/program/beasiswa-yatim");
    expect(getCampaignDetailHref("zakat-penghasilan")).toBe("/zis/zakat-penghasilan");
    expect(getCampaignDetailHref("air-bersih")).toBe("/program/air-bersih");
    expect(getCampaignDetailHref(null)).toBe("/program");

    expect(getCampaignDonateHref({ slug: "infaq-masjid", categorySlug: "infaq" })).toBe("/zis/infaq-masjid/donasi");
    expect(getCampaignDonateHref({ slug: "beasiswa-yatim", categorySlug: "pendidikan" })).toBe("/program/beasiswa-yatim/donasi");
    expect(getCampaignDonateHref(null)).toBe("/program");
  });
});

