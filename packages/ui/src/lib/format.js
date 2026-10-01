/**
 * Display formatting only. Amounts arrive from the server in minor units
 * and are never computed on here — only divided for display.
 */

const moneyFormatters = new Map();

/** `formatMoney(550000, "ETB")` → "ETB 5,500.00". */
export function formatMoney(minor, currency = "ETB") {
  if (minor == null || !Number.isFinite(Number(minor))) return null;
  let formatter = moneyFormatters.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "code" });
    } catch {
      formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    moneyFormatters.set(currency, formatter);
  }
  // Intl puts a no-break space after the code; keep it so "ETB" never wraps alone.
  return formatter.format(Number(minor) / 100);
}

/** "just now", "4 min ago", "3 h ago", "yesterday", or a date. */
export function timeAgo(value, now = Date.now()) {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "yesterday";
  return formatDate(time);
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
