import { describe, it, expect } from "vitest";
import { buildUserWhereClause } from "@/services/donorAnalyticsHelper";

describe("Donor Identity Linking (Email & Phone Multi-Identifier)", () => {
  it("menghasilkan filter berbasis email jika hanya email yang tersedia", () => {
    const clause = buildUserWhereClause("donatur@example.com", "Donatur");
    expect(clause).toEqual({
      donorEmail: { equals: "donatur@example.com", mode: "insensitive" },
    });
  });

  it("menghasilkan filter nomor telepon lokal (08...) dan internasional (628...) jika hanya nomor telepon yang tersedia", () => {
    const clause = buildUserWhereClause("", "", "081234567890");
    expect(clause).toEqual({
      OR: [
        { donorPhone: "081234567890" },
        { donorPhone: "6281234567890" },
      ],
    });
  });

  it("menghubungkan donasi via OR condition saat donatur memiliki email DAN nomor telepon terdaftar", () => {
    const clause = buildUserWhereClause("budi@example.com", "Budi", "0812-3456-7890");
    expect(clause).toEqual({
      OR: [
        { donorEmail: { equals: "budi@example.com", mode: "insensitive" } },
        { donorPhone: "081234567890" },
        { donorPhone: "6281234567890" },
      ],
    });
  });

  it("melakukan normalisasi nomor telepon berawalan 62 dengan benar", () => {
    const clause = buildUserWhereClause("", "", "+6281299998888");
    expect(clause).toEqual({
      OR: [
        { donorPhone: "081299998888" },
        { donorPhone: "6281299998888" },
      ],
    });
  });

  it("melakukan fallback ke nama donatur hanya jika email dan telepon kosong", () => {
    const clause = buildUserWhereClause("", "H. Budi Santoso", "");
    expect(clause).toEqual({
      OR: [
        { donorName: { equals: "H. Budi Santoso", mode: "insensitive" } },
        { donorName: { contains: "Budi Santoso", mode: "insensitive" } },
      ],
    });
  });

  it("mengembalikan null jika tidak ada parameter identitas yang valid", () => {
    expect(buildUserWhereClause("", "", "")).toBeNull();
    expect(buildUserWhereClause(null, null, null)).toBeNull();
  });
});
