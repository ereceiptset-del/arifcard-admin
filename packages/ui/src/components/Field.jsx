import { forwardRef, useId } from "react";

const CONTROL_BASE =
  "w-full rounded-field border bg-panel dark:bg-[#141823] px-3 text-[13.5px] text-ink dark:text-ink-dark placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-55 disabled:cursor-not-allowed";

function borderClass(invalid) {
  return invalid
    ? "border-danger"
    : "border-line-strong dark:border-line-strong-dark focus:border-brand";
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
          className="mb-1.5 block text-[13px] font-medium text-ink dark:text-ink-dark"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>
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
        className={`h-10 ${CONTROL_BASE} ${borderClass(error)}`}
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
        className={`h-10 ${CONTROL_BASE} ${borderClass(error)}`}
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
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong dark:border-line-strong-dark text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          {...props}
        />
        <label htmlFor={boxId} className="text-[13px] leading-relaxed text-ink dark:text-ink-dark">
          {label}
        </label>
      </div>
      {error && <p className="mt-1.5 text-[12px] text-danger">{error}</p>}
    </div>
  );
}
