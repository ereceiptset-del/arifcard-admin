import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import { loginSchema, validate } from "../../validation/authSchemas";

/**
 * LoginForm
 *
 * Light-mode authentication form for the /login route.
 * Matches the reference screenshot:
 * - Direct placement on light background (#FAFAFA), no card/shadow wrapper
 * - Width: max-w-[384px]
 * - Heading: "Sign in" (22px, font-semibold)
 * - Subtitle: "Use the email on your account." (14px, #687180)
 * - Email input with placeholder "you@example.com"
 * - Password input with right-aligned "Forgot your password?" label and Eye toggle
 * - Purple "Sign In" button (#8055FF)
 * - Bottom link: "New here? Create an account"
 *
 * Submits to POST /api/auth/login via AuthContext#login. A 403
 * EMAIL_NOT_VERIFIED response (the account exists but never completed the
 * OTP step) gets a distinct message with a link back to /verify instead of
 * the generic "invalid email or password" — there's no dashboard route yet
 * (that lands in a later phase), so a successful login currently redirects
 * to the landing page.
 */
function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setUnverifiedEmail("");

    const { data, fieldErrors: errors } = validate(loginSchema, { email, password });
    if (errors) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);
    try {
      await login(data);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.email);
      } else {
        setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
      setIsLoading(false);
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
          Sign in
        </h1>
        <p className="mt-1 text-sm text-[#687180] dark:text-[#A6AFBE]">
          Use the email on your account.
        </p>
      </div>

      {justVerified && !formError && !unverifiedEmail && (
        <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400">
          Your email is verified. Sign in to continue.
        </p>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {formError && (
          <p role="alert" className="text-xs text-red-500 dark:text-red-400">
            {formError}
          </p>
        )}

        {unverifiedEmail && (
          <p role="alert" className="text-xs text-red-500 dark:text-red-400">
            Please verify your email before signing in.{" "}
            <Link
              to={`/verify?email=${encodeURIComponent(unverifiedEmail)}`}
              className="font-semibold underline"
            >
              Verify now
            </Link>
          </p>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9] mb-1.5"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-[13.5px] font-medium text-[#101217] dark:text-[#F6F7F9]"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[12.5px] text-[#687180] dark:text-[#A6AFBE] hover:text-[#101217] dark:hover:text-[#F6F7F9] transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
            "Sign In"
          )}
        </button>
      </form>

      {/* Bottom Navigation */}
      <div className="mt-5 text-[13.5px] text-[#687180] dark:text-[#A6AFBE]">
        <span>New here?</span>{" "}
        <Link
          to="/register"
          className="font-semibold text-[#101217] dark:text-[#F6F7F9] hover:text-[#8055FF] transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default LoginForm;
