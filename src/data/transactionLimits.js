/**
 * Data master ketentuan batas minimum dan maksimum transaksi donasi.
 * Hanya menautkan logo yang benar-benar tersedia di direktori aset publik.
 */

export const VA_TRANSACTION_LIMITS = [
  {
    id: "va-bri",
    name: "VA BRI",
    description: "BRImo, ATM BRI, AgenBRILink",
    logo: "/img/branding/payments/bri.webp",
    minAmount: 10000,
    maxAmount: 50000000,
  },
  {
    id: "va-mandiri",
    name: "VA Mandiri",
    description: "Livin' by Mandiri, ATM Mandiri",
    logo: "/img/branding/payments/mandiri.webp",
    minAmount: 10000,
    maxAmount: 50000000,
  },
];

export const EWALLET_QRIS_TRANSACTION_LIMITS = [
  {
    id: "qris-nasional",
    name: "QRIS",
    description: "Standar Bank Indonesia (Seluruh M-Banking & Dompet Digital)",
    logo: "/img/branding/payments/qris.webp",
    minAmount: 10000,
    maxAmount: 20000000,
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Aplikasi GoPay & Gojek",
    logo: "/img/branding/payments/gopay.webp",
    minAmount: 10000,
    maxAmount: 20000000,
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    description: "Aplikasi Shopee & ShopeePay",
    logo: "/img/branding/payments/shopeepay.webp",
    minAmount: 10000,
    maxAmount: 20000000,
  },
  {
    id: "indomaret",
    name: "Indomaret",
    description: "Gerai Indomaret & Ceriamart",
    logo: "/img/branding/payments/indomaret.webp",
    minAmount: 10000,
    maxAmount: 5000000,
  },
  {
    id: "alfamart",
    name: "Alfamart",
    description: "Gerai Alfamart, Alfamidi & Dan+Dan",
    logo: "/img/branding/payments/alfamart.webp",
    minAmount: 10000,
    maxAmount: 5000000,
  },
];
