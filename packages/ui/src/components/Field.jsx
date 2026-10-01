import { forwardRef, useId } from "react";

const CONTROL_BASE =
  "w-full rounded-control border bg-surface-1 px-3 text-base sm:text-body text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-55 disabled:cursor-not-allowed";

function borderClass(invalid) {
  return invalid
    ? "border-danger"
    : "border-line-strong focus:border-accent";
}

/**
 * Label + control + hint/error wrapper.
 *
 * The error is wired to the control through `aria-describedby`, and the
 * hint is only announced when there is no error to replace it.
 */
export function Field({ label, hint, error, required, htmlFor, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-small font-medium text-ink"
        >
          {label}
          {required && <span aria-hidden className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-caption text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-caption text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const TextInput = forwardRef(function TextInput(
  { label, hint, error, required, className = "", id, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const describedBy = error || hint ? `${inputId}-desc` : undefined;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId} className={className}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-11 ${CONTROL_BASE} ${borderClass(error)}`}
        {...props}
      />
    </Field>
  );
});

export const SelectInput = forwardRef(function SelectInput(
  { label, hint, error, required, options = [], placeholder = "Select an option", className = "", id, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={selectId} className={className}>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`h-11 ${CONTROL_BASE} ${borderClass(error)}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
});

export const TextArea = forwardRef(function TextArea(
  { label, hint, error, required, rows = 4, className = "", id, ...props },
  ref
) {
  const generatedId = useId();
  const areaId = id || generatedId;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={areaId} className={className}>
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={`py-2.5 ${CONTROL_BASE} ${borderClass(error)}`}
        {...props}
      />
    </Field>
  );
});

/** Checkbox with an adjacent label. Always starts from the caller's state. */
export function Checkbox({ label, checked, onChange, error, id, ...props }) {
  const generatedId = useId();
  const boxId = id || generatedId;

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id={boxId}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          {...props}
        />
        <label htmlFor={boxId} className="text-small leading-relaxed text-ink">
          {label}
        </label>
      </div>
      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}
    </div>
  );
}

/**
 * On/off switch for a setting that takes effect immediately. Only use it
 * for settings the backend actually stores — never for a local-only toggle.
 */
export function Switch({ label, description, checked, onChange, disabled = false, id }) {
  const generatedId = useId();
  const switchId = id || generatedId;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={switchId} className="text-small font-medium text-ink">
          {label}
        </label>
        {description && <p id={`${switchId}-desc`} className="mt-0.5 text-caption text-ink-muted">{description}</p>}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${switchId}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "border-accent bg-accent" : "border-line-strong bg-surface-2"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-5 w-5 rounded-full bg-surface-1 shadow-e1 transition-transform duration-150 ${checked ? "translate-x-[22px]" : "translate-x-[3px]"}`}
        />
      </button>
    </div>
  );
}
