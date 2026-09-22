import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import * as authService from "../../services/authService";
import { ApiError } from "../../services/api";
import { registerSchema, validate } from "../../validation/authSchemas";

/**
 * RegisterForm
 *
 * Light-mode registration form for the /register route.
 * Matches the reference screenshot:
 * - Direct placement on light background (#FAFAFA), no card/shadow wrapper
 * - Width: max-w-[384px]
 * - Heading: "Create your account" (22px, font-semibold)
 * - Subtitle: "We will send a code to verify it is you." (14px, #687180)
 * - Fields: Full name, Email, Password (with Eye visibility toggle)
 * - Primary CTA: "Create account" (#8055FF)
 * - Terms & Privacy agreement notice
 * - Bottom link: "Already have an account? Sign in"
 *
 * Submits to POST /api/auth/register (see backend/src/routes/auth.routes.js).
 * Validates with Zod first for instant feedback; the backend re-validates
 * regardless and is the real source of truth.
 */
function RegisterForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const { data, fieldErrors: errors } = validate(registerSchema, { fullName, email, password });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);
    try {
      await authService.register(data);
      navigate(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[384px]">
      {/* Mobile-only wordmark so branding remains visible when left panel collapses */}
      <div className="lg:hidden mb-8">
        <Link to="/" className="text-[18px] font-semibold tracking-tight text-[#101217] dark:text-[#F6F7F9]">
          Arifcard
        </Link>
      </div>

      {/* Heading & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#101217] dark:text-[#F6F7F9] tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[#687180] dark:text-[#A6AFBE]">
          We will send a code to verify it is you.
        </p>
      </div>

      {/* Registration Fields */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {formError && (
          <p role="alert" className="text-xs text-red-500 dark:text-red-400">
            {formError}
          </p>
        )}

        {/* Full Name Field */}
        <div>
          <label
            htmlFor="register-fullname"
            className="block text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9] mb-1.5"
          >
            Full name
          </label>
          <input
            id="register-fullname"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName) || undefined}
            className={`h-10 w-full rounded-lg border bg-white dark:bg-[#141823] px-3 text-sm text-[#101217] dark:text-[#F6F7F9] placeholder:text-[#9CA3AF] dark:placeholder:text-[#5B6472] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8055FF]/20 ${
              fieldErrors.fullName
                ? "border-red-400 dark:border-red-500"
                : "border-[#D5DAE1] dark:border-[#303643] focus:border-[#8055FF]"
            }`}
          />
          {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.fullName}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9] mb-1.5"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            className={`h-10 w-full rounded-lg border bg-white dark:bg-[#141823] px-3 text-sm text-[#101217] dark:text-[#F6F7F9] placeholder:text-[#9CA3AF] dark:placeholder:text-[#5B6472] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8055FF]/20 ${
              fieldErrors.email
                ? "border-red-400 dark:border-red-500"
                : "border-[#D5DAE1] dark:border-[#303643] focus:border-[#8055FF]"
            }`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9] mb-1.5"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password) || undefined}
              className={`h-10 w-full rounded-lg border bg-white dark:bg-[#141823] px-3 pr-10 text-sm text-[#101217] dark:text-[#F6F7F9] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#8055FF]/20 ${
                fieldErrors.password
                  ? "border-red-400 dark:border-red-500"
                  : "border-[#D5DAE1] dark:border-[#303643] focus:border-[#8055FF]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 p-1 text-[#9CA3AF] dark:text-[#687180] hover:text-[#687180] dark:hover:text-[#A6AFBE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 rounded"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative mt-2 h-10 w-full rounded-lg bg-[#8055FF] hover:bg-[#7447F8] active:bg-[#6C3FE0] disabled:bg-[#A98FF5] text-white text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8055FF]/30 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Terms & Privacy Notice */}
      <p className="mt-3 text-[12.5px] leading-relaxed text-[#687180] dark:text-[#A6AFBE]">
        By creating an account you agree to the{" "}
        <a href="#terms" className="underline hover:text-[#101217] dark:hover:text-[#F6F7F9] transition-colors">
          terms of service
        </a>{" "}
        and{" "}
        <a href="#privacy" className="underline hover:text-[#101217] dark:hover:text-[#F6F7F9] transition-colors">
          privacy policy
        </a>
        .
      </p>

      {/* Bottom Navigation */}
      <div className="mt-5 text-[13.5px] text-[#687180] dark:text-[#A6AFBE]">
        <span>Already have an account?</span>{" "}
        <Link
          to="/login"
          className="font-semibold text-[#101217] dark:text-[#F6F7F9] hover:text-[#8055FF] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default RegisterForm;
