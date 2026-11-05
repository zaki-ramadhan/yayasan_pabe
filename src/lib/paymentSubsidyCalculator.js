import { PAYMENT_CHANNELS } from "@/data/paymentChannels";

/**
 * Pre-indexed dictionary of payment channel subsidy rates derived from PAYMENT_CHANNELS.
 */
export const CHANNEL_SUBSIDY_RATES = PAYMENT_CHANNELS.reduce((acc, channel) => {
  acc[channel.id] = {
    type: channel.subsidyType || "free",
    rate: channel.subsidyRate || 0,
    amount: channel.subsidyAmount || 0,
    label: channel.subsidyLabel || "Gratis (0%)",
  };
  return acc;
}, {});

/**
 * Helper to normalize polymorphic argument inputs: (channelOrId, amount) or (amount, channelOrId).
 */
function normalizeParams(arg1, arg2) {
  let channelOrId;
  let amount;

  if (typeof arg1 === "object" || (typeof arg1 === "string" && isNaN(Number(arg1)))) {
    channelOrId = arg1;
    amount = arg2;
  } else if (typeof arg2 === "object" || (typeof arg2 === "string" && isNaN(Number(arg2)))) {
    amount = arg1;
    channelOrId = arg2;
  } else {
    // Both are numbers or strings: arg1 is amount, arg2 is channel
    amount = arg1;
    channelOrId = arg2;
  }

  return {
    numAmount: Number(amount) || 0,
    channelOrId,
  };
}

/**
 * Calculates the exact Midtrans payment gateway fee subsidized/borne by the foundation.
 * Ensures whole integer precision (no floating-point rounding issues).
 *
 * @param {string|object|number} arg1 - channelOrId OR amount
 * @param {string|object|number} arg2 - amount OR channelOrId
 * @returns {number} Subsidized fee amount in IDR (rounded integer)
 */
export function calculatePaymentSubsidy(arg1, arg2) {
  const { numAmount, channelOrId } = normalizeParams(arg1, arg2);
  if (numAmount <= 0) return 0;

  const channel =
    typeof channelOrId === "string"
      ? PAYMENT_CHANNELS.find((c) => c.id === channelOrId)
      : channelOrId;

  if (!channel) return 0;

  if (channel.subsidyType === "percentage") {
    const rate = Number(channel.subsidyRate) || 0;
    return Math.round(numAmount * rate);
  }

  if (channel.subsidyType === "fixed") {
    return Math.round(Number(channel.subsidyAmount) || 0);
  }

  return 0;
}

/**
 * Calculates the estimated net settlement amount received by the foundation.
 *
 * @param {string|object|number} arg1 - channelOrId OR amount
 * @param {string|object|number} arg2 - amount OR channelOrId
 * @returns {number} Net settlement amount in IDR
 */
export function calculateNetSettlement(arg1, arg2) {
  const { numAmount, channelOrId } = normalizeParams(arg1, arg2);
  if (numAmount <= 0) return 0;
  const subsidy = calculatePaymentSubsidy(numAmount, channelOrId);
  return Math.max(0, numAmount - subsidy);
}

/**
 * Returns a comprehensive subsidy breakdown object for financial reporting.
 *
 * @param {string|object|number} arg1 - channelOrId OR amount
 * @param {string|object|number} arg2 - amount OR channelOrId
 * @returns {object} Subsidy breakdown metadata
 */
export function getPaymentSubsidyBreakdown(arg1, arg2) {
  const { numAmount, channelOrId } = normalizeParams(arg1, arg2);
  const channel =
    typeof channelOrId === "string"
      ? PAYMENT_CHANNELS.find((c) => c.id === channelOrId) || { id: channelOrId, name: channelOrId }
      : channelOrId || { id: "unknown", name: "Kanal Tidak Dikenal" };

  const subsidyFee = calculatePaymentSubsidy(numAmount, channel);
  const netSettlement = Math.max(0, numAmount - subsidyFee);

  return {
    grossAmount: numAmount,
    channelId: channel.id,
    channelName: channel.name,
    subsidyFee,
    netAmount: netSettlement,
    netSettlement,
    subsidyLabel: channel.subsidyLabel || (subsidyFee > 0 ? `Rp ${subsidyFee.toLocaleString("id-ID")}` : "Rp 0 (Gratis)"),
  };
}
