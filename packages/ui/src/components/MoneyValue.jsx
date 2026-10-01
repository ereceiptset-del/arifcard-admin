import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { formatMoney, timeAgo } from "../lib/format.js";

/**
 * A money figure with its freshness.
 *
 * - `amountMinor` + `currency` render the figure in tabular numerals.
 * - Without an amount, `unavailableReason` renders "Unavailable" and the
 *   reason — never a zero, never a placeholder figure.
 * - `checkedAt` is when Arifcard last fetched the value ("Checked 2 min
 *   ago"); a figure is never shown without it.
 * - The value region is `aria-live="polite"`, so a change is announced.
 */
export function MoneyValue({
  label,
  amountMinor,
  currency = "ETB",
  unavailableReason = "Not available right now.",
  checkedAt,
  onRefresh,
  refreshing = false,
  size = "hero",
  className = "",
}) {
  const formatted = formatMoney(amountMinor, currency);
  const known = formatted != null && checkedAt != null;
  const freshness = useTicking(checkedAt);

  const valueClass = size === "hero" ? "text-money-sm sm:text-money" : "text-h2";

  return (
    <div className={`min-w-0 ${className}`}>
      {label && <p className="text-small font-medium text-ink-muted">{label}</p>}
      <div aria-live="polite" aria-atomic="true" className="mt-1">
        {known ? (
          <p className={`${valueClass} tabular-nums text-ink`}>{formatted}</p>
        ) : (
          <>
            <p className="text-h2 text-ink-soft">Unavailable</p>
            <p className="mt-1 max-w-xs text-small text-ink-muted">{unavailableReason}</p>
          </>
        )}
      </div>
      {(freshness || onRefresh) && (
        <div className="mt-2 flex items-center gap-2 text-caption text-ink-muted">
          {freshness && <span>Checked {freshness}</span>}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-50"
            >
              <RefreshCw size={14} aria-hidden className={refreshing ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Re-renders every 30 s so "N min ago" stays true while the page is open. */
export function useTicking(value) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!value) return undefined;
    const timer = setInterval(() => setTick((tick) => tick + 1), 30_000);
    return () => clearInterval(timer);
  }, [value]);
  return value ? timeAgo(value) : null;
}
