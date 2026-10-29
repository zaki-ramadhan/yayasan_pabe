import { describe, it, expect } from "vitest";
import {
  toggleKeyInSet,
  toggleAllKeysInSet,
  computeSelectionDerived,
} from "@/hooks/useTableSelection";

describe("useTableSelection Pure Logic Unit Tests", () => {
  const mockItems = [
    { id: "item-1", name: "Berkas A", size: 1024 },
    { id: "item-2", name: "Berkas B", size: 2048 },
    { id: "item-3", name: "Berkas C", size: 4096 },
  ];

  const defaultKeyExtractor = (item) => item?.id ?? item?.key;

  describe("toggleKeyInSet", () => {
    it("menambahkan kunci jika belum ada pada Set", () => {
      const initial = new Set(["item-1"]);
      const next = toggleKeyInSet(initial, "item-2");

      expect(next.has("item-1")).toBe(true);
      expect(next.has("item-2")).toBe(true);
      expect(next.size).toBe(2);
      // Memastikan immutability (Set baru dibuat)
      expect(next).not.toBe(initial);
    });

    it("menghapus kunci jika sudah ada pada Set", () => {
      const initial = new Set(["item-1", "item-2"]);
      const next = toggleKeyInSet(initial, "item-2");

      expect(next.has("item-1")).toBe(true);
      expect(next.has("item-2")).toBe(false);
      expect(next.size).toBe(1);
    });

    it("mengabaikan jika key null atau undefined", () => {
      const initial = new Set(["item-1"]);
      expect(toggleKeyInSet(initial, null)).toBe(initial);
      expect(toggleKeyInSet(initial, undefined)).toBe(initial);
    });
  });

  describe("toggleAllKeysInSet", () => {
    it("menambahkan seluruh kunci saat checked bernilai true", () => {
      const initial = new Set(["item-1"]);
      const allKeys = ["item-1", "item-2", "item-3"];
      const next = toggleAllKeysInSet(initial, allKeys, true);

      expect(next.size).toBe(3);
      expect(next.has("item-1")).toBe(true);
      expect(next.has("item-2")).toBe(true);
      expect(next.has("item-3")).toBe(true);
    });

    it("menghapus seluruh kunci yang aktif saat checked bernilai false", () => {
      const initial = new Set(["item-1", "item-2", "item-3", "other-page-item"]);
      const allKeys = ["item-1", "item-2", "item-3"];
      const next = toggleAllKeysInSet(initial, allKeys, false);

      expect(next.size).toBe(1);
      expect(next.has("other-page-item")).toBe(true);
      expect(next.has("item-1")).toBe(false);
    });
  });

  describe("computeSelectionDerived", () => {
    it("menghitung status awal dengan benar saat seleksi kosong", () => {
      const derived = computeSelectionDerived(mockItems, new Set(), defaultKeyExtractor);

      expect(derived.selectedCount).toBe(0);
      expect(derived.totalCount).toBe(3);
      expect(derived.allSelected).toBe(false);
      expect(derived.someSelected).toBe(false);
      expect(derived.isIndeterminate).toBe(false);
      expect(derived.selectedItems).toEqual([]);
      expect(derived.allCurrentKeys).toEqual(["item-1", "item-2", "item-3"]);
    });

    it("menghitung status sebagian terpilih (someSelected & isIndeterminate)", () => {
      const selected = new Set(["item-2"]);
      const derived = computeSelectionDerived(mockItems, selected, defaultKeyExtractor);

      expect(derived.selectedCount).toBe(1);
      expect(derived.totalCount).toBe(3);
      expect(derived.allSelected).toBe(false);
      expect(derived.someSelected).toBe(true);
      expect(derived.isIndeterminate).toBe(true);
      expect(derived.selectedItems).toEqual([mockItems[1]]);
    });

    it("mendeteksi saat semua item terpilih (allSelected)", () => {
      const selected = new Set(["item-1", "item-2", "item-3"]);
      const derived = computeSelectionDerived(mockItems, selected, defaultKeyExtractor);

      expect(derived.selectedCount).toBe(3);
      expect(derived.totalCount).toBe(3);
      expect(derived.allSelected).toBe(true);
      expect(derived.someSelected).toBe(true);
      expect(derived.isIndeterminate).toBe(false);
      expect(derived.selectedItems.length).toBe(3);
    });

    it("mendukung keyExtractor kustom untuk objek yang menggunakan properti key", () => {
      const customItems = [
        { key: "gallery/doc-1.jpg", title: "Foto 1" },
        { key: "gallery/doc-2.jpg", title: "Foto 2" },
      ];
      const selected = new Set(["gallery/doc-1.jpg"]);
      const derived = computeSelectionDerived(
        customItems,
        selected,
        (item) => item.key
      );

      expect(derived.selectedCount).toBe(1);
      expect(derived.allCurrentKeys).toEqual(["gallery/doc-1.jpg", "gallery/doc-2.jpg"]);
      expect(derived.selectedItems).toEqual([customItems[0]]);
    });

    it("menangani kasus defensif jika items bukan array atau null", () => {
      const derived = computeSelectionDerived(null, new Set(), defaultKeyExtractor);

      expect(derived.totalCount).toBe(0);
      expect(derived.selectedCount).toBe(0);
      expect(derived.allSelected).toBe(false);
      expect(derived.selectedItems).toEqual([]);
    });
  });
});
