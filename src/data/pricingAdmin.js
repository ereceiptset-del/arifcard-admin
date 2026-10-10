import { backendApi } from "@addiscard/services";

/**
 * Pricing (backend services/pricing): the policy in force and the approved
 * USD/ETB rate. The backend calculates every quote; this site only shows
 * the policy and lets an administrator set a new rate (versioned, audited).
 */
export const pricingAdmin = {
  get: () => backendApi.get("/admin/pricing", { auth: true }),
  /** Administrator, audited: a new approved rate. Existing quotes keep theirs. */
  setRate: ({ etbPerUsd, note }) => backendApi.post("/admin/pricing/rate", { etbPerUsd, note }, { auth: true }),
};

/** "200.0000" -> "200.00"; extra decimals kept when the rate has them. */
export function rateText(etbPerUsd) {
  const [whole, fraction = ""] = String(etbPerUsd || "").split(".");
  const trimmed = fraction.replace(/0+$/, "");
  return `${Number(whole).toLocaleString("en-US")}.${trimmed.length >= 2 ? trimmed : trimmed.padEnd(2, "0")}`;
}

/** A fee rule in words: "1%", "25.00 ETB", "25.00 ETB + 1%". */
export function feeText(rule) {
  if (!rule) return "—";
  const etb = (minor) => `${(minor / 100).toFixed(2)} ETB`;
  if (rule.type === "percentage") return `${rule.percentage}%`;
  if (rule.type === "fixed") return etb(rule.fixedMinor);
  if (rule.type === "fixed_plus_percentage") return `${etb(rule.fixedMinor)} + ${rule.percentage}%`;
  return rule.type;
}
