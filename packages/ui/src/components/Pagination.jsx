import { Button } from "./Button.jsx";

/**
 * Cursor pagination: Previous / Next plus an optional range label. The
 * caller owns cursors; nothing here assumes a total count exists.
 * `mode="more"` renders a single "Show more" button for infinite lists.
 */
export function Pagination({ hasPrevious, hasNext, onPrevious, onNext, loading = false, rangeLabel, mode = "pages", moreLabel = "Show more" }) {
  if (mode === "more") {
    if (!hasNext) return null;
    return (
      <div className="flex justify-center pt-2">
        <Button variant="secondary" onClick={onNext} loading={loading}>
          {moreLabel}
        </Button>
      </div>
    );
  }
  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-2">
      <p className="text-small text-ink-muted" aria-live="polite">
        {rangeLabel}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onPrevious} disabled={!hasPrevious || loading}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasNext || loading} loading={loading && hasNext}>
          Next
        </Button>
      </div>
    </nav>
  );
}
