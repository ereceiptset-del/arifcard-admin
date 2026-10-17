import { useId, useState } from "react";
import { Eye, EyeOff, CircleAlert, CircleCheck } from "lucide-react";

/**
 * Building blocks shared by the sign-in, sign-up, verify and reset forms,
 * so every auth screen has the same fields, messages and button.
 *
 * Inputs are 16px on phones (no zoom on focus) and 15px from `sm` up,
 * 44px tall, with the error tied to the field (aria-describedby).
 */

const inputClass = (invalid, extra = "") =>
  `h-11 w-full rounded-control border bg-surface-1 px-3 text-base text-ink placeholder:text-ink-muted transition-colors duration-150 sm:text-body focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 ${
    invalid ? "border-danger" : "border-line-strong focus:border-accent"
  } ${extra}`;

/** Heading block: the page's h1 and one line under it. */
export function AuthHeading({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-h1 font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-2 max-w-[44ch] text-body text-ink-muted">{subtitle}</p>}
    </div>
  );
}

/** A labelled text input. `aside` sits at the right of the label (e.g. "Forgot password?"). */
export function AuthTextField({ label, error, hint, aside, id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const describedBy = [hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="text-small font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      <input id={fieldId} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} className={inputClass(error)} {...props} />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** A password input with a show/hide button inside it. */
export function AuthPasswordField({ label, error, hint, aside, id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const [visible, setVisible] = useState(false);
  const describedBy = [hint && `${fieldId}-hint`, error && `${fieldId}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="text-small font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={inputClass(error, "pr-12")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-control text-ink-muted transition-colors hover:text-ink"
        >
          {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
        </button>
      </div>
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-caption text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** A checkbox with its label; the whole row is the 44px target. */
export function AuthCheckbox({ label, checked, onChange, id }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <label htmlFor={fieldId} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-small text-ink">
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4.5 shrink-0 cursor-pointer rounded-tag border-line-strong accent-accent"
      />
      {label}
    </label>
  );
}

/** A message above the form: icon + words + colour, never colour alone. */
export function FormMessage({ tone = "danger", children }) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  const style = tone === "success" ? "border-success/30 bg-success-tint text-success" : "border-danger/30 bg-danger-tint text-danger";
  return (
    <div role={tone === "success" ? "status" : "alert"} className={`flex gap-2.5 rounded-control border px-3 py-2.5 text-small ${style}`}>
      <Icon size={16} aria-hidden className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** The form's one primary action. Busy: a spinner and the same words, read out by screen readers. */
export function AuthSubmit({ busy, busyLabel, children }) {
  return (
    <button
      type="submit"
      disabled={busy}
      aria-busy={busy || undefined}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-control bg-accent text-body font-semibold text-on-accent shadow-e1 transition-colors duration-150 hover:bg-accent-hover active:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
    >
      {busy && (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {busy ? busyLabel || children : children}
    </button>
  );
}

/** "Don't have an account? Create one" — the switch between sign-in and sign-up. */
export function AuthSwitch({ prompt, children }) {
  return (
    <p className="text-small text-ink-muted">
      {prompt} {children}
    </p>
  );
}

// A 44px-tall tap area around a one-line link, without moving the text around it.
export const authLinkClass = "-my-3 inline-flex min-h-11 items-center font-semibold text-link underline-offset-4 hover:underline";
