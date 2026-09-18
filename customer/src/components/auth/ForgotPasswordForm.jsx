import { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";
import { ApiError } from "../../services/api";
import { forgotPasswordSchema, validate } from "../../validation/authSchemas";

/**
 * ForgotPasswordForm
 *
 * Rendered inside AuthLayout at /forgot-password.
 * - Heading: "Reset your password"
 * - Subtitle: "Enter your email to receive reset instructions."
 * - Email input, "Send reset link" CTA, "Back to sign in" link.
 *
 * Submits to POST /api/auth/forgot-password, which always resolves the
 * same way whether or not the account exists (no email enumeration) — so
 * the only realistic failure here is a network error or a malformed email
 * caught by client-side Zod validation before the request is even sent.
 */
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setFormError("");

    const { data, fieldErrors } = validate(forgotPasswordSchema, { email });
    if (fieldErrors) {
      setFieldError(fieldErrors.email);
      return;
    }
    setFieldError("");

    setStatus("loading");
    try {
      await authService.forgotPassword(data);
      setStatus("sent");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="w-full max-w-[384px]">
      {/* Mobile-only wordmark so branding remains visible when left panel collapses */}
      <div className="lg:hidden mb-8">
        <Link to="/" className="text-[18px] font-semibold tracking-tight text-[#101217] dark:text-[#F6F7F9]">
          Addiscard
        </Link>
      </div>

      {/* Heading & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#101217] dark:text-[#F6F7F9] tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-[#687180] dark:text-[#A6AFBE]">
          Enter your email to receive reset instructions.
        </p>
      </div>

      {status === "sent" ? (
        <div
          role="status"
          className="mt-6 rounded-lg border border-[#D5DAE1] dark:border-[#303643] bg-white dark:bg-[#141823] px-4 py-3 text-sm text-[#101217] dark:text-[#F6F7F9]"
        >
          If an account exists for <span className="font-semibold">{email}</span>, reset
          instructions are on the way.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          {formError && (
            <p role="alert" className="text-xs text-red-500 dark:text-red-400">
              {formError}
            </p>
          )}

          <div>
            <label
              htmlFor="forgot-email"
              className="block text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9] mb-1.5"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldError) || undefined}
              className={`h-10 w-full rounded-lg border bg-white dark:bg-[#141823] px-3 text-sm text-[#101217] dark:text-[#F6F7F9] placeholder:text-[#9CA3AF] dark:placeholder:text-[#5B6472] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8055FF]/20 ${
                fieldError
                  ? "border-red-400 dark:border-red-500"
                  : "border-[#D5DAE1] dark:border-[#303643] focus:border-[#8055FF]"
              }`}
            />
            {fieldError && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldError}</p>}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="relative mt-2 h-10 w-full rounded-lg bg-[#8055FF] hover:bg-[#7447F8] active:bg-[#6C3FE0] disabled:bg-[#A98FF5] text-white text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 flex items-center justify-center"
          >
            {status === "loading" ? (
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
      )}

      {/* Bottom Navigation */}
      <div className="mt-5 text-[13.5px] text-[#687180] dark:text-[#A6AFBE]">
        <Link
          to="/login"
          className="font-semibold text-[#101217] dark:text-[#F6F7F9] hover:text-[#8055FF] transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
