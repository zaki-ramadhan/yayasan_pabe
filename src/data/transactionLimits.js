import { ASSET_PATHS } from "@/lib/assetConstants";

/**
 * Data master ketentuan batas minimum dan maksimum transaksi donasi.
 * Hanya menautkan saluran pembayaran digital aktif dan logo resmi yang tersedia.
 */

export const VA_TRANSACTION_LIMITS = [
  {
    id: "va-bca",
    name: "BCA Virtual Account",
    description: "BCA mobile, myBCA, KlikBCA, ATM BCA",
    logo: ASSET_PATHS.PAYMENTS.BCA,
    minAmount: 10000,
    maxAmount: 50000000,
  },
  {
    id: "va-mandiri",
    name: "Mandiri Bill Payment",
    description: "Livin' by Mandiri, ATM Mandiri",
    logo: ASSET_PATHS.PAYMENTS.MANDIRI,
    minAmount: 10000,
    maxAmount: 50000000,
  },
  {
    id: "va-bri",
    name: "BRI Virtual Account (BRIVA)",
    description: "BRImo, ATM BRI, AgenBRILink",
    logo: ASSET_PATHS.PAYMENTS.BRI,
    minAmount: 10000,
    maxAmount: 50000000,
  },
  {
    id: "va-bni",
    name: "BNI Virtual Account",
    description: "BNI Mobile Banking, wondr by BNI, ATM BNI",
    logo: ASSET_PATHS.PAYMENTS.BNI,
    minAmount: 10000,
    maxAmount: 50000000,
  },
  {
    id: "va-permata",
    name: "Permata Virtual Account",
    description: "PermataMobile X, PermataNet, ATM Permata",
    logo: ASSET_PATHS.PAYMENTS.PERMATA,
    minAmount: 10000,
    maxAmount: 50000000,
  },
];

export const EWALLET_QRIS_TRANSACTION_LIMITS = [
  {
    id: "qris-nasional",
    name: "QRIS",
    description: "Standar Bank Indonesia (Seluruh M-Banking & Dompet Digital)",
    logo: ASSET_PATHS.PAYMENTS.QRIS,
    minAmount: 10000,
    maxAmount: 20000000,
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Aplikasi GoPay & Gojek",
    logo: ASSET_PATHS.PAYMENTS.GOPAY,
    minAmount: 10000,
    maxAmount: 20000000,
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    description: "Aplikasi Shopee & ShopeePay",
    logo: ASSET_PATHS.PAYMENTS.SHOPEEPAY,
    minAmount: 10000,
    maxAmount: 20000000,
  },
];
