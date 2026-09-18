import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import OtpInput from "./OtpInput";
import { useCountdown } from "../../hooks/useCountdown";
import * as authService from "../../services/authService";
import { ApiError } from "../../services/api";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 5 * 60;
const SUCCESS_REDIRECT_DELAY_MS = 900;

/**
 * VerifyForm
 *
 * Rendered inside AuthLayout at /verify?email=... .
 * - Segmented 6-digit OTP input (auto-focus, backspace/arrow nav, paste).
 * - "Verify" CTA disabled until all 6 digits are entered; shows a spinner
 *   while verifying, then a temporary "Verified ✓" state before redirecting
 *   to /login (there's no automatic sign-in — the password isn't held
 *   client-side after registration, so the user signs in explicitly).
 * - Expiration countdown ("Code expires in 4:58") — no resend action; the
 *   backend enforces the real 5-minute TTL, this is a client-side mirror
 *   of it purely for the countdown display.
 */
function VerifyForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email";

  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const { formatted, expired } = useCountdown(EXPIRY_SECONDS);

  const isComplete = code.length === CODE_LENGTH;
  const isInvalid = status === "error";
  const isBusy = status === "verifying" || status === "success";

  const handleChange = (next) => {
    setCode(next);
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete || isBusy) return;

    setStatus("verifying");
    try {
      await authService.verifyEmail({ email, code });
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status !== "success") return undefined;
    const id = setTimeout(() => {
      navigate(`/login?verified=1&email=${encodeURIComponent(email)}`);
    }, SUCCESS_REDIRECT_DELAY_MS);
    return () => clearTimeout(id);
  }, [status, email, navigate]);

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
          Verify your account
        </h1>
        <p className="mt-1 text-sm text-[#687180] dark:text-[#A6AFBE]">
          Enter the 6 digit code we sent to{" "}
          <span className="font-semibold text-[#101217] dark:text-[#F6F7F9]">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <OtpInput
          value={code}
          onChange={handleChange}
          invalid={isInvalid}
          disabled={isBusy}
        />

        {isInvalid && (
          <p role="alert" className="-mt-2 text-xs text-red-500 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={!isComplete || isBusy}
          className="relative h-10 w-full rounded-lg bg-[#8055FF] hover:bg-[#7447F8] active:bg-[#6C3FE0] disabled:bg-[#A98FF5] text-white text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 flex items-center justify-center gap-2"
        >
          {status === "verifying" && (
            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          <span>{status === "success" ? "Verified ✓" : status === "verifying" ? "Verifying…" : "Verify"}</span>
        </button>
      </form>

      {/* Expiration countdown — intentionally no resend action */}
      <p className="mt-5 text-[12.5px] text-[#687180] dark:text-[#A6AFBE]">
        {expired ? "This code has expired." : `Code expires in ${formatted}`}
      </p>
    </div>
  );
}

export default VerifyForm;
