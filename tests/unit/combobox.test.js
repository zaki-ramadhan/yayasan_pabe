import { describe, it, expect } from "vitest";

describe("Combobox - Logika Normalisasi dan Filter Lookup", () => {
  const mockCampaigns = [
    { id: "c1", title: "Bimbel Yatim Mandiri", categoryName: "Pendidikan" },
    { id: "c2", title: "Ambulans Gratis Dhuafa", categoryName: "Kesehatan" },
    { id: "c3", title: "Santunan Lansia Dhuafa", categoryName: "Sosial" },
    { id: "c4", title: "Pembangunan Masjid Desa", categoryName: "Dakwah" },
    { id: "c5", title: "Sedekah Subuh Berkah", categoryName: "Sosial" },
    { id: "c6", title: "Wakaf Al-Quran Pelosok", categoryName: "Dakwah" },
  ];

  it("menormalisasi data campaign ke format standar combobox", () => {
    const normalized = mockCampaigns.map((camp) => ({
      value: camp.id,
      label: camp.title,
      category: camp.categoryName || "Program Umum",
    }));

    expect(normalized).toHaveLength(6);
    expect(normalized[0]).toEqual({
      value: "c1",
      label: "Bimbel Yatim Mandiri",
      category: "Pendidikan",
    });
  });

  it("melakukan lookup pencarian berdasarkan judul program", () => {
    const query = "ambulans";
    const filtered = mockCampaigns.filter((c) =>
      c.title.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("c2");
  });

  it("melakukan lookup pencarian berdasarkan nama kategori", () => {
    const query = "dakwah";
    const filtered = mockCampaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.categoryName.toLowerCase().includes(query.toLowerCase())
    );

    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(["c4", "c6"]);
  });

  it("mengaktifkan input pencarian jika jumlah item melebihi atau sama dengan searchThreshold (5)", () => {
    const searchThreshold = 5;
    const shouldShowSearch = mockCampaigns.length >= searchThreshold;
    expect(shouldShowSearch).toBe(true);

    const fewItems = mockCampaigns.slice(0, 3);
    const shouldHideSearchForFew = fewItems.length >= searchThreshold;
    expect(shouldHideSearchForFew).toBe(false);
  });
});
