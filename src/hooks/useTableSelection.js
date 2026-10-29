"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * Mengubah status satu kunci pada Set seleksi (tambah jika belum ada, hapus jika sudah ada).
 * @param {Set<string|number>} currentSet
 * @param {string|number} key
 * @returns {Set<string|number>}
 */
export function toggleKeyInSet(currentSet, key) {
  if (key === undefined || key === null) return currentSet;
  const next = new Set(currentSet);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

/**
 * Memilih semua atau membatalkan pilihan semua kunci yang aktif.
 * @param {Set<string|number>} currentSet
 * @param {(string|number)[]} allKeys
 * @param {boolean} checked
 * @returns {Set<string|number>}
 */
export function toggleAllKeysInSet(currentSet, allKeys, checked) {
  const next = new Set(currentSet);
  if (checked) {
    allKeys.forEach((key) => next.add(key));
  } else {
    allKeys.forEach((key) => next.delete(key));
  }
  return next;
}

/**
 * Menghitung status turunan seleksi (derived states).
 * @template T
 * @param {T[]} items
 * @param {Set<string|number>} selectedIds
 * @param {(item: T) => string|number} keyExtractor
 */
export function computeSelectionDerived(items, selectedIds, keyExtractor) {
  const safeItems = Array.isArray(items) ? items : [];
  const allCurrentKeys = safeItems
    .map(keyExtractor)
    .filter((k) => k !== undefined && k !== null);

  const selectedCount = selectedIds?.size || 0;
  const totalCount = safeItems.length;

  const allSelected =
    totalCount > 0 && allCurrentKeys.every((key) => selectedIds?.has(key));

  const someSelected = selectedCount > 0;
  const isIndeterminate = someSelected && !allSelected;

  const selectedItems = safeItems.filter((item) =>
    selectedIds?.has(keyExtractor(item))
  );

  return {
    allCurrentKeys,
    selectedCount,
    totalCount,
    allSelected,
    isAllSelected: allSelected,
    someSelected,
    isIndeterminate,
    isPartiallySelected: isIndeterminate,
    selectedItems,
  };
}

/**
 * Hook terpusat untuk state manajemen pemilihan baris tabel jamak (Bulk Selection).
 * Menerapkan prinsip DRY, SOLID, dan SSOT di seluruh antarmuka tabel admin.
 *
 * @template T
 * @param {T[]} [items=[]] - Daftar item data yang tersedia pada tabel saat ini
 * @param {object} [options]
 * @param {(item: T) => string|number} [options.keyExtractor] - Fungsi pengambil ID unik per item (default: item.id || item.key)
 * @param {Set<string|number>} [options.initialSelected] - State awal item terpilih
 */
export function useTableSelection(items = [], options = {}) {
  const {
    keyExtractor = (item) => item?.id ?? item?.key,
    initialSelected = new Set(),
  } = options;

  const [selectedIds, setSelectedIds] = useState(() => new Set(initialSelected));

  const derived = useMemo(
    () => computeSelectionDerived(items, selectedIds, keyExtractor),
    [items, selectedIds, keyExtractor]
  );

  // Toggle seleksi satu baris
  const toggleSelect = useCallback((key) => {
    setSelectedIds((prev) => toggleKeyInSet(prev, key));
  }, []);

  // Toggle seleksi semua baris tabel aktif
  const toggleSelectAll = useCallback(
    (checked) => {
      setSelectedIds((prev) => {
        const shouldSelectAll =
          typeof checked === "boolean" ? checked : !derived.allSelected;
        return toggleAllKeysInSet(prev, derived.allCurrentKeys, shouldSelectAll);
      });
    },
    [derived.allCurrentKeys, derived.allSelected]
  );

  // Memilih seluruh baris aktif secara eksplisit
  const selectAll = useCallback(() => {
    setSelectedIds((prev) =>
      toggleAllKeysInSet(prev, derived.allCurrentKeys, true)
    );
  }, [derived.allCurrentKeys]);

  // Bersihkan seluruh seleksi
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Tentukan apakah sebuah ID sedang terpilih
  const isSelected = useCallback(
    (key) => selectedIds.has(key),
    [selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    selectedCount: derived.selectedCount,
    totalCount: derived.totalCount,
    selectedItems: derived.selectedItems,
    allSelected: derived.allSelected,
    isAllSelected: derived.allSelected,
    someSelected: derived.someSelected,
    isIndeterminate: derived.isIndeterminate,
    isPartiallySelected: derived.isIndeterminate,
    toggleSelect,
    toggleSelectAll,
    selectAll,
    clearSelection,
    isSelected,
  };
}
