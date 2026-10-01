import { CircleX, WifiOff } from "lucide-react";
import { Button } from "./Button.jsx";

/**
 * A failed load: what happened and what to do next, with a retry.
 * Network failures (`NETWORK_ERROR`, status 0) render as the offline state.
 */
export function ErrorState({ title = "We couldn't load this", message, error, onRetry, headingLevel = 2, className = "" }) {
  const Heading = `h${headingLevel}`;
  if (error && (error.code === "NETWORK_ERROR" || error.status === 0)) {
    return <OfflineState onRetry={onRetry} headingLevel={headingLevel} className={className} />;
  }
  return (
    <div role="alert" className={`rounded-panel border border-line bg-surface-1 px-5 py-8 text-center ${className}`}>
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger-tint text-danger">
        <CircleX size={20} aria-hidden />
      </span>
      <Heading className="text-h3 text-ink">{title}</Heading>
      <p className="mx-auto mt-1 max-w-md text-small text-ink-muted">
        {message || error?.message || "Try again in a moment."}
      </p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/** No connection to Arifcard. Says so plainly; nothing on screen is presented as current. */
export function OfflineState({ onRetry, headingLevel = 2, className = "" }) {
  const Heading = `h${headingLevel}`;
  return (
    <div role="alert" className={`rounded-panel border border-line bg-surface-1 px-5 py-8 text-center ${className}`}>
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-tint text-neutral">
        <WifiOff size={20} aria-hidden />
      </span>
      <Heading className="text-h3 text-ink">You're offline</Heading>
      <p className="mx-auto mt-1 max-w-md text-small text-ink-muted">
        We couldn't reach Arifcard. Check your connection, then try again.
      </p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
