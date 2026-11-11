import { describe, it, expect } from "vitest";
import {
  TRANSACTION_TABS,
  ZIS_CAMPAIGN_WHERE,
  ZIS_DONATION_WHERE,
  buildDonationTypeWhere,
  isZisTransaction,
  getTransactionTypeLabel,
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
    ).toBe("Program ZIS");
    expect(
      getTransactionTypeLabel({
        donationType: "CAMPAIGN",
        routineDonationId: "rtn-1",
      })
    ).toBe("Donasi Rutin");
    expect(getTransactionTypeLabel({ donationType: "CAMPAIGN" })).toBe("Donasi Program");
  });
});

