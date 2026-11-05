/**
 * @file fieldValidationLimits.js
 * @description Single Source of Truth (SSOT) untuk batasan panjang karakter (minLength & maxLength)
 * pada seluruh input dan textarea aplikasi Yayasan Payung Berkah.
 *
 * Menerapkan prinsip DRY, SOLID, dan SoC agar batas karakter konsisten
 * antara validasi form UI, sanitasi frontend, dan skema database.
 */

export const FIELD_LIMITS = {
  // Identitas Personal (Donatur, Relawan, Pelamar, Pengguna)
  NAME: { min: 2, max: 60 },
  USERNAME: { min: 3, max: 30 },
  EMAIL: { min: 5, max: 100 },
  PHONE: { min: 10, max: 16 },
  PASSWORD: { min: 8, max: 60 },
  PASSWORD_SIMPLE: { min: 6, max: 50 },

  // Perbankan & Finansial
  BANK_NAME: { min: 3, max: 60 },
  BANK_ACCOUNT_NUMBER: { min: 5, max: 30 },
  BANK_ACCOUNT_NAME: { min: 2, max: 60 },
  CURRENCY_INPUT: { min: 1, max: 20 },
  ZAKAT_GOLD_GRAM: { min: 1, max: 10 },

  // Profil & Domisili
  BIO: { min: 3, max: 160 },
  CITY: { min: 2, max: 50 },
  ADDRESS: { min: 5, max: 255 },
  AVATAR_URL: { min: 5, max: 500 },

  // Doa & Interaksi Donatur
  PRAYER: { min: 3, max: 250 },
  PRAYER_BAR: { min: 3, max: 250 },

  // Relawan & Pelamar Karir
  MOTIVATION: { min: 10, max: 500 },
  CAREER_MOTIVATION: { min: 10, max: 1000 },
  CAREER_POSITION: { min: 3, max: 100 },
  CAREER_EXPERIENCE: { min: 3, max: 80 },
  CAREER_SUMMARY: { min: 10, max: 1000 },
  CAREER_RESPONSIBILITY: { min: 10, max: 2000 },
  CAREER_REQUIREMENT: { min: 10, max: 2000 },

  // Program & Penyaluran (Admin)
  PROGRAM_TITLE: { min: 5, max: 100 },
  PROGRAM_LOCATION: { min: 3, max: 100 },
  PROGRAM_DESCRIPTION: { min: 20, max: 2000 },
  DISTRIBUTION_TITLE: { min: 5, max: 150 },
  DISTRIBUTION_DESCRIPTION: { min: 20, max: 3000 },

  // Artikel & Berita (Admin)
  ARTICLE_TITLE: { min: 5, max: 150 },
  ARTICLE_AUTHOR: { min: 2, max: 80 },
  ARTICLE_EXCERPT: { min: 10, max: 300 },
  ARTICLE_CONTENT: { min: 20, max: 5000 },

  // Laporan Audit (Admin)
  AUDIT_YEAR: { min: 4, max: 4 },
  AUDIT_TITLE: { min: 5, max: 150 },
  AUDITOR_NAME: { min: 3, max: 100 },
  AUDIT_OPERATIONAL_RATIO: { min: 1, max: 20 },
  AUDIT_SUMMARY: { min: 10, max: 500 },
  AUDIT_AMOUNT: { min: 1, max: 25 },

  // Kategori, FAQ & Galeri (Admin)
  CATEGORY_NAME: { min: 2, max: 60 },
  CATEGORY_SLUG: { min: 2, max: 60 },
  FAQ_QUESTION: { min: 5, max: 255 },
  FAQ_CATEGORY_TOPIC: { min: 2, max: 50 },
  FAQ_ANSWER: { min: 10, max: 3000 },
  GALLERY_TITLE: { min: 3, max: 120 },
  GALLERY_DESCRIPTION: { min: 5, max: 500 },

  // Media Sosial & URL
  INSTAGRAM_USERNAME: { min: 3, max: 50 },
  INSTAGRAM_DISPLAY_NAME: { min: 2, max: 100 },
  INSTAGRAM_CAPTION: { min: 5, max: 2000 },
  INSTAGRAM_URL: { min: 10, max: 300 },
  MEDIA_URL: { min: 10, max: 500 },

  // Pengaturan Kelembagaan (Admin Settings)
  FOUNDATION_NAME: { min: 3, max: 100 },
  FOUNDATION_SHORT_NAME: { min: 2, max: 30 },
  FOUNDATION_TAGLINE: { min: 5, max: 150 },
  FOUNDATION_VISION: { min: 10, max: 500 },
  CONTACT_ADDRESS: { min: 10, max: 255 },
  CONTACT_WHATSAPP: { min: 10, max: 20 },
  CONTACT_EMAIL: { min: 5, max: 100 },
  CONTACT_PHONE: { min: 6, max: 25 },
  CONTACT_OFFICE_HOURS: { min: 3, max: 60 },
  LEGAL_NUMBER: { min: 5, max: 60 },
  LEGAL_NPWP: { min: 15, max: 25 },

  // Pencarian & Filter UI
  SEARCH_QUERY: { min: 1, max: 100 },
  SEARCH_TOOLBAR: { min: 1, max: 80 },
  COMBOBOX_SEARCH: { min: 1, max: 100 },
  TIME_DIGIT: { min: 2, max: 2 },
};
