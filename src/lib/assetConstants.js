/**
 * Konfigurasi terpusat path aset statis lokal (Anti-Magic String).
 * Mengelompokkan seluruh berkas gambar berdasarkan konteks fungsionalnya:
 * - BRANDING: Logo yayasan dan lembaga mitra resmi
 * - PAYMENTS: Saluran pembayaran (QRIS, VA, E-Wallet, Retail)
 * - FRAMES: Frame SVG dekoratif berbentuk folder hero dan folder admin
 * - DECORATIONS: Ornamen visual kartu bank dan aksen garis
 * - TEXTURES: Tekstur overlay latar belakang
 * - AVATARS: Placeholder avatar laki-laki dan perempuan
 * - ILLUSTRATIONS: Ilustrasi state kosong (empty state)
 */
export const ASSET_PATHS = {
  BRANDING: {
    LOGO: "/img/branding/logo-ypabe.webp",
    ICON: "/img/branding/icon.webp",
    FAVICON: "/img/branding/favicon.ico",
    PARTNER_MAIN: "/img/branding/partners/logo-partner-main.webp",
    KEMENKUMHAM: "/img/branding/partners/logo-kemenkumham.webp",
    DINSOS_DARK: "/img/branding/partners/logo-dinsos-dark.webp",
    DINSOS_WHITE: "/img/branding/partners/logo-dinsos-white.webp",
  },
  PAYMENTS: {
    QRIS: "/img/branding/payments/qris.webp",
    QRIS_BARCODE: "/img/branding/payments/qris-barcode.webp",
    QRIS_STANDEE: "/img/branding/payments/qris-standee.webp",
    BRI: "/img/branding/payments/bri.webp",
    BNI: "/img/branding/payments/bni.webp",
    MANDIRI: "/img/branding/payments/mandiri.webp",
    GOPAY: "/img/branding/payments/gopay.webp",
    SHOPEEPAY: "/img/branding/payments/shopeepay.webp",
    INDOMARET: "/img/branding/payments/indomaret.webp",
    ALFAMART: "/img/branding/payments/alfamart.webp",
    ALFAMIDI: "/img/branding/payments/alfamidi.webp",
    AKULAKU: "/img/branding/payments/akulaku.webp",
    KREDIVO: "/img/branding/payments/kredivo.webp",
    PERMATA: "/img/branding/payments/permata.webp",
  },
  FRAMES: {
    FOLDER_ADMIN: "/img/frames/folder-admin.svg",
    FOLDER_HERO: "/img/frames/folder-hero.svg",
  },
  DECORATIONS: {
    LINE_ACCENT: "/img/decorations/line-accent.svg",
    BANK_CARD_GOLD: "/img/decorations/bank-card-gold.webp",
    BANK_CARDS_SHOWCASE: "/img/decorations/bank-cards-showcase.webp",
    BANK_CARDS_CLASSIC: "/img/decorations/bank-cards-classic.webp",
  },
  TEXTURES: {
    OVERLAY_1: "/img/textures/texture-overlay-1.webp",
    OVERLAY_2: "/img/textures/texture-overlay-2.webp",
    OVERLAY_3: "/img/textures/texture-overlay-3.webp",
    OVERLAY_4: "/img/textures/texture-overlay-4.webp",
    OVERLAY_5: "/img/textures/texture-overlay-5.webp",
    WALLPAPER_CHAT: "/img/textures/wallpaper-chat.webp",
  },
  AVATARS: {
    MALE: "/img/avatars/avatar-male.svg",
    FEMALE: "/img/avatars/avatar-female.svg",
  },
  ILLUSTRATIONS: {
    EMPTY_STATE: "/img/illustrations/empty-state.webp",
  },
  BANNERS: {
    HERO_SLIDE_1: "/img/banners/hero/hero-slide-1.webp",
    HERO_SLIDE_2: "/img/banners/hero/hero-slide-2.webp",
    HERO_SLIDE_3: "/img/banners/hero/hero-slide-3.webp",
    CTA_MAIN: "/img/banners/cta/cta-banner.webp",
    ABOUT_COVER: "/img/banners/covers/about-cover.webp",
    AUTH_SLIDE_1: "/img/banners/auth/auth-slide-1.webp",
    AUTH_SLIDE_2: "/img/banners/auth/auth-slide-2.webp",
    AUTH_SLIDE_3: "/img/banners/auth/auth-slide-3.webp",
  },
};
