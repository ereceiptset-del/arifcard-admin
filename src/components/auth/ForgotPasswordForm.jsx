import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import OtpInput from "./OtpInput";
import * as authService from "../../services/authService";
import { ApiError } from "../../services/api";
import { forgotPasswordSchema, resetPasswordSchema, validate } from "../../validation/authSchemas";
import { useCountdown } from "../../hooks/useCountdown";

const CODE_LENGTH = 6;
// Mirrors RESET_EXPIRY_MINUTES in backend/src/services/auth.service.js.
const EXPIRY_SECONDS = 15 * 60;
const SUCCESS_REDIRECT_DELAY_MS = 900;

/**
 * ForgotPasswordForm
 *
 * Two-step password reset at /forgot-password (and /reset-password, which
 * opens straight on step two via `defaultStep="reset"`):
 *
 *   1. "request" — collect the email, POST /api/auth/forgot-password.
 *   2. "reset"   — collect the emailed 6-digit code plus a new password,
 *                  POST /api/auth/reset-password.
 *
 * Step one always advances to step two, whether or not an account exists.
 * That is deliberate: the backend returns an identical response either way
 * so this endpoint can't be used to discover which emails are registered,
 * and stopping early for unknown emails would leak exactly that.
 */
function ForgotPasswordForm({ defaultStep = "request" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(defaultStep === "reset" ? "reset" : "request");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const { formatted, expired } = useCountdown(EXPIRY_SECONDS);
  const isCodeComplete = code.length === CODE_LENGTH;

  // Step 1 — request the emailed reset code.
  const handleRequest = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setFormError("");

    const { data, fieldErrors: errors } = validate(forgotPasswordSchema, { email });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setStatus("loading");
    try {
      await authService.forgotPassword(data);
      setEmail(data.email);
      setStep("reset");
      setStatus("idle");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  // Step 2 — submit the code and the new password.
  const handleReset = async (e) => {
    e.preventDefault();
    if (status === "loading") return;
    setFormError("");

    const { data, fieldErrors: errors } = validate(resetPasswordSchema, {
      email,
      code,
      newPassword,
      confirmPassword,
    });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setStatus("loading");
    try {
      await authService.resetPassword({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setStatus("success");
    } catch (err) {
      // The backend collapses wrong/expired/too-many-attempts into one
      // generic message on purpose — surface it as-is.
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    if (status === "loading") return;
    setFormError("");
    setStatus("loading");
    try {
      await authService.forgotPassword({ email });
      setCode("");
      setStatus("idle");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (status !== "success") return undefined;
    const id = setTimeout(() => navigate("/login?reset=1"), SUCCESS_REDIRECT_DELAY_MS);
    return () => clearTimeout(id);
  }, [status, navigate]);

  const inputClass = (hasError) =>
    `h-11 w-full rounded-lg border bg-surface-1  px-3 text-sm text-ink placeholder:text-ink-muted  transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${
      hasError
        ? "border-danger"
        : "border-line-strong  focus:border-accent"
    }`;

  const spinner = (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );

  return (
    <div className="w-full max-w-[384px]">
      {/* Mobile-only wordmark so branding remains visible when left panel collapses */}
      <div className="lg:hidden mb-8">
        <Link to="/" className="text-[18px] font-semibold tracking-tight text-ink">
          Arifcard
        </Link>
      </div>

      <div>
        <h1 className="text-[22px] font-semibold text-ink tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {step === "request" ? (
            "Enter your email to receive a reset code."
          ) : (
            <>
              Enter the 6 digit code we sent to{" "}
              <span className="font-semibold text-ink">{email}</span>, then
              choose a new password.
            </>
          )}
        </p>
      </div>

      {step === "request" ? (
        <form onSubmit={handleRequest} className="mt-6 flex flex-col gap-4" noValidate>
          {formError && (
            <p role="alert" className="text-xs text-danger">
              {formError}
            </p>
          )}

          <div>
            <label
              htmlFor="forgot-email"
              className="block text-small font-medium text-ink mb-1.5"
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
              aria-invalid={Boolean(fieldErrors.email) || undefined}
              className={inputClass(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="relative mt-2 h-11 w-full rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 text-on-accent text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 flex items-center justify-center"
          >
            {status === "loading" ? spinner : "Send reset code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="mt-6 flex flex-col gap-4" noValidate>
          {formError && (
            <p role="alert" className="text-xs text-danger">
              {formError}
            </p>
          )}

          <div>
            <span className="block text-small font-medium text-ink mb-2">
              Reset code
            </span>
            <OtpInput
              value={code}
              onChange={(next) => {
                setCode(next);
                if (formError) setFormError("");
              }}
              invalid={Boolean(formError) || Boolean(fieldErrors.code)}
              disabled={status === "loading" || status === "success"}
            />
            {fieldErrors.code && (
              <p className="mt-1.5 text-xs text-danger">{fieldErrors.code}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-small font-medium text-ink mb-1.5"
            >
              New password
            </label>
            <div className="relative flex items-center">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={Boolean(fieldErrors.newPassword) || undefined}
                className={`${inputClass(fieldErrors.newPassword)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 p-1 text-ink-muted hover:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.newPassword ? (
              <p className="mt-1 text-xs text-danger">{fieldErrors.newPassword}</p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-muted">At least 8 characters.</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-small font-medium text-ink mb-1.5"
            >
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmPassword) || undefined}
              className={inputClass(fieldErrors.confirmPassword)}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-danger">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isCodeComplete || status === "loading" || status === "success"}
            className="relative mt-2 h-11 w-full rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 text-on-accent text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 flex items-center justify-center gap-2"
          >
            {status === "loading" && spinner}
            <span>{status === "success" ? "Password updated ✓" : "Reset password"}</span>
          </button>

          <div className="flex items-center justify-between gap-3 text-small text-ink-muted">
            <span>{expired ? "This code has expired." : `Code expires in ${formatted}`}</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={status === "loading" || status === "success"}
              className="font-semibold text-accent-ink hover:text-accent-ink disabled:opacity-60 transition-colors"
            >
              Send again
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 flex items-center gap-3 text-small text-ink-muted">
        {step === "reset" && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setCode("");
                setFormError("");
                setFieldErrors({});
              }}
              className="font-semibold text-ink hover:text-accent-ink transition-colors"
            >
              Use a different email
            </button>
            <span aria-hidden className="text-ink-muted">
              |
            </span>
          </>
        )}
        <Link
          to="/login"
          className="font-semibold text-ink hover:text-accent-ink transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordForm;
