/**
 * Utility client-safe untuk format identitas relawan yayasan
 */

/**
 * Format nomor registrasi resmi relawan yayasan yang ringkas dan modern (angka numerik murni)
 * Contoh: 260142 (2 digit tahun + 4 digit nomor unik)
 */
export function formatVolunteerId(id = "", dateInput = null) {
  const yearSuffix = dateInput
    ? String(new Date(dateInput).getFullYear()).slice(-2)
    : String(new Date().getFullYear()).slice(-2);

  // Jika id sudah memiliki minimal 4 digit angka di dalamnya
  const numericOnly = String(id).replace(/\D/g, "");
  if (numericOnly.length >= 4) {
    return `${yearSuffix}${numericOnly.slice(-4)}`;
  }

  // Jika id berupa string CUID / alfanumerik (misal cm7...tvul),
  // ubah secara deterministik menjadi 4 digit angka konsisten (0001 - 9999)
  let hash = 0;
  const str = String(id || "volunteer");
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  const numericCode = ((hash % 9999) + 1).toString().padStart(4, "0");

  return `${yearSuffix}${numericCode}`;
}

/**
 * Memformat nama relawan agar pas dan simetris di dalam kotak rasio 1:1 KTA.
 * Jika nama terlalu panjang, nama disingkat secara cerdas (inisial di tengah atau di awal/akhir)
 * dan dipecah menjadi maksimal 2 baris terpusat.
 *
 * @param {string} fullName - Nama lengkap relawan
 * @param {number} maxLineChars - Batas karakter maksimal per baris agar font tetap proporsional (default: 13)
 * @returns {{ line1: string, line2: string, displayName: string }}
 */
export function formatVolunteerBadgeName(fullName = "", maxLineChars = 13) {
  if (!fullName || typeof fullName !== "string") {
    return { line1: "Relawan", line2: "Kebaikan", displayName: "Relawan Kebaikan" };
  }

  const clean = fullName.trim().replace(/\s+/g, " ");
  if (!clean) {
    return { line1: "Relawan", line2: "Kebaikan", displayName: "Relawan Kebaikan" };
  }

  const words = clean.split(" ");

  // Kasus 1 kata
  if (words.length === 1) {
    const single =
      words[0].length > maxLineChars + 3
        ? `${words[0].slice(0, maxLineChars)}...`
        : words[0];
    return { line1: single, line2: "", displayName: single };
  }

  // Kasus 2 kata: Idealnya 1 kata di line 1 dan 1 kata di line 2
  if (words.length === 2) {
    let [w1, w2] = words;
    if (w1.length > maxLineChars) {
      if (/^(muh(ammad)?|moch(ammad)?)$/i.test(w1)) {
        w1 = "M.";
      } else if (/^ahmad$/i.test(w1)) {
        w1 = "Ah.";
      } else {
        w1 = `${w1.slice(0, maxLineChars - 1)}.`;
      }
    }
    if (w2.length > maxLineChars) {
      w2 = `${w2.slice(0, maxLineChars - 1)}.`;
    }
    return { line1: w1, line2: w2, displayName: `${w1} ${w2}` };
  }

  // Kasus >= 3 kata
  const processed = [...words];

  // Singkat kata pertama jika merupakan awalan panjang populer
  if (/^(muh(ammad)?|moch(ammad)?)$/i.test(processed[0])) {
    processed[0] = "M.";
  } else if (/^ahmad$/i.test(processed[0])) {
    processed[0] = "Ah.";
  }

  let line1 = "";
  let line2 = "";

  if (processed.length === 3) {
    // 3 kata: [W0, W1, W2]
    if (`${processed[0]} ${processed[1]}`.length <= maxLineChars) {
      line1 = `${processed[0]} ${processed[1]}`;
      line2 = processed[2];
    } else {
      const middleInitial = `${processed[1][0]}.`;
      if (`${processed[0]} ${middleInitial}`.length <= maxLineChars) {
        line1 = `${processed[0]} ${middleInitial}`;
        line2 = processed[2];
      } else {
        line1 = `${processed[0][0]}. ${processed[1]}`;
        line2 = processed[2];
      }
    }
  } else {
    // >= 4 kata: contoh "Siti Nurhaliza Rahmawati Putri" atau "M. Ilham Bintang Ramadhan"
    const first = processed[0];
    const last = processed[processed.length - 1];
    const middleWords = processed.slice(1, -1);

    const middleInitials = middleWords.map((w) => `${w[0]}.`).join(" ");

    if (`${first} ${middleInitials}`.length <= maxLineChars) {
      line1 = `${first} ${middleInitials}`;
      line2 = last;
    } else {
      const firstMiddle = `${middleWords[0][0]}.`;
      line1 = `${first} ${firstMiddle}`;
      const restMiddle = middleWords.slice(1).map((w) => `${w[0]}.`).join(" ");
      line2 = restMiddle ? `${restMiddle} ${last}` : last;
    }
  }

  if (line1.length > maxLineChars + 3) {
    line1 = `${line1.slice(0, maxLineChars)}...`;
  }
  if (line2.length > maxLineChars + 3) {
    line2 = `${line2.slice(0, maxLineChars)}...`;
  }

  const displayName = line2 ? `${line1} ${line2}` : line1;
  return { line1, line2, displayName };
}
