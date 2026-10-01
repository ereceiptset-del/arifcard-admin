import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const LENGTH = 6;

function splitToDigits(value) {
  const chars = value.replace(/\D/g, "").slice(0, LENGTH).split("");
  return Array.from({ length: LENGTH }, (_, i) => chars[i] || "");
}

/**
 * OtpInput
 *
 * Controlled 6-digit segmented verification code input. Keeps an internal
 * per-cell array as the source of truth (so a digit typed into a
 * non-sequential cell, e.g. after Tab or a click, stays at that exact
 * position) and reports a flattened string to the parent for completeness
 * checks.
 *
 * - Numeric only, one digit per cell.
 * - Auto-focuses the first cell on mount.
 * - Backspace: clears the current cell, or moves back and clears the
 *   previous cell if the current one is already empty.
 * - Left/Right arrow keys move focus between cells.
 * - Pasting a 6-digit string fills every cell and focuses the last one.
 * - `invalid` triggers a brief shake (skipped under prefers-reduced-motion).
 */
function OtpInput({ value = "", onChange, disabled = false, invalid = false, autoFocus = true }) {
  const [digits, setDigits] = useState(() => splitToDigits(value));
  const inputsRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  // Tracks the last flattened string *this component* emitted, so the
  // resync effect below can tell "parent echoed our own update" (skip —
  // it's lossy for gaps, e.g. a digit typed into cell 3 flattens to a
  // 1-character string) apart from "parent reset the value externally"
  // (resync for real).
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setDigits(splitToDigits(value));
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const commit = (nextDigits) => {
    setDigits(nextDigits);
    const flat = nextDigits.join("");
    lastEmitted.current = flat;
    onChange(flat);
  };

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit || "";
    commit(next);
    if (digit && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        commit(next);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    commit(splitToDigits(pasted));
    inputsRef.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <motion.div
      role="group"
      aria-label="6-digit verification code"
      className="flex gap-2.5"
      animate={invalid && !prefersReducedMotion ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {digits.map((digit, index) => (
        <input
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={invalid || undefined}
          className={`h-12 w-11 sm:w-12 rounded-lg border bg-surface-1  text-center text-lg font-semibold tabular-nums text-ink transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 ${
            invalid
              ? "border-danger"
              : "border-line-strong  focus:border-accent"
          }`}
        />
      ))}
    </motion.div>
  );
}

export default OtpInput;
