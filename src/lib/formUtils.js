/**
 * formUtils.js
 * Utilitas terpusat untuk mendeteksi perubahan nilai pada formulir (dirty-checking),
 * normalisasi input, dan evaluasi kesamaan data berbasis SSOT (Single Source of Truth).
 */

/**
 * Normalisasi nilai primitif untuk komparasi formulir:
 * - null, undefined, dan string spasi kosong dinormalisasi menjadi ""
 * - String dipangkas spasi depan dan belakang (.trim())
 */
export function normalizeFormValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return isNaN(value) ? "" : value;
  if (typeof value === "boolean") return value;
  if (value instanceof Date) return isNaN(value.getTime()) ? "" : value.toISOString();
  return value;
}

/**
 * Membandingkan dua nilai secara mendalam (deep comparison) untuk kebutuhan formulir.
 * Mengembalikan true jika kedua nilai dianggap identik (tidak ada perubahan).
 */
export function areFormValuesEqual(a, b) {
  const normA = normalizeFormValue(a);
  const normB = normalizeFormValue(b);

  // 1. Primitive direct comparison
  if (normA === normB) return true;

  // 2. Jika salah satu bernilai primitive atau salah satu null/undefined setelah normalisasi
  if (
    typeof normA !== "object" ||
    typeof normB !== "object" ||
    normA === "" ||
    normB === "" ||
    normA === null ||
    normB === null
  ) {
    return normA === normB;
  }

  // 3. Array comparison
  if (Array.isArray(normA) && Array.isArray(normB)) {
    if (normA.length !== normB.length) return false;
    for (let i = 0; i < normA.length; i++) {
      if (!areFormValuesEqual(normA[i], normB[i])) return false;
    }
    return true;
  }

  // Jika satu array dan yang lain bukan array
  if (Array.isArray(normA) !== Array.isArray(normB)) return false;

  // 4. Object comparison
  const keysA = Object.keys(normA);
  const keysB = Object.keys(normB);
  const allKeys = new Set([...keysA, ...keysB]);

  for (const key of allKeys) {
    if (!areFormValuesEqual(normA[key], normB[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Mengecek apakah form mengalami perubahan nilai (isDirty / hasChanges).
 * @param {any} initial - Nilai awal / data acuan
 * @param {any} current - Nilai saat ini di form
 * @returns {boolean} true jika ada perubahan nilai, false jika identik
 */
export function isFormDirty(initial, current) {
  return !areFormValuesEqual(initial, current);
}
