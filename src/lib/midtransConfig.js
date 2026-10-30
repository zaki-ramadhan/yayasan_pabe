/**
 * Midtrans Configuration & Environment Resolution (SSOT)
 */

export const isMidtransProduction = () => {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
};

export const getMidtransServerKey = () => {
  return process.env.MIDTRANS_SERVER_KEY || "";
};

export const getMidtransClientKey = () => {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
};

export const getMidtransSnapApiUrl = () => {
  return isMidtransProduction()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
};

export const getMidtransCoreApiChargeUrl = () => {
  return isMidtransProduction()
    ? "https://api.midtrans.com/v2/charge"
    : "https://api.sandbox.midtrans.com/v2/charge";
};

export const getMidtransCoreApiStatusUrl = (orderId) => {
  const baseUrl = isMidtransProduction()
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";
  return `${baseUrl}/${encodeURIComponent(orderId)}/status`;
};

export const getMidtransSnapScriptUrl = () => {
  return isMidtransProduction()
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
};

export const getMidtransAuthHeader = () => {
  const serverKey = getMidtransServerKey();
  if (!serverKey) return "";
  const token = Buffer.from(`${serverKey}:`).toString("base64");
  return `Basic ${token}`;
};

/**
 * Domain status mapper: normalizes raw Midtrans transaction status into internal status
 */
export const mapMidtransStatusToDomain = (transactionStatus = "", fraudStatus = "") => {
  const status = String(transactionStatus).toLowerCase();
  const fraud = String(fraudStatus).toLowerCase();

  if (status === "capture") {
    return fraud === "challenge" ? "PENDING" : "PAID";
  }
  if (status === "settlement") {
    return "PAID";
  }
  if (status === "pending") {
    return "PENDING";
  }
  if (status === "deny" || status === "cancel") {
    return "CANCELLED";
  }
  if (status === "expire") {
    return "EXPIRED";
  }

  return "PENDING";
};
