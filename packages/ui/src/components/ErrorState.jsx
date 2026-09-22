import { AlertCircle } from "lucide-react";
import { Button } from "./Button.jsx";

/** Failure block with a retry affordance. Used wherever a fetch can fail. */
export function ErrorState({ title = "Something went wrong", message, onRetry, className = "" }) {
  return (
    <div
      role="alert"
      className={`rounded-panel border border-danger/25 bg-danger/5 px-5 py-6 text-center ${className}`}
    >
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle size={19} />
      </span>
      <h3 className="text-[14px] font-semibold text-ink dark:text-ink-dark">{title}</h3>
      {message && (
        <p className="mt-1.5 text-[13px] text-ink-muted dark:text-ink-muted-dark">{message}</p>
      )}
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
