import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import { loginSchema, validate } from "../../validation/authSchemas";

/**
 * LoginForm
 *
 * Light-mode authentication form for the /login route.
 * Opens the admin dashboard on success. Whether the account is staff is
 * decided by the server; a non-staff account is refused by RequireStaff.
 */
function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get("verified") === "1";
  const justReset = searchParams.get("reset") === "1";

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

      // A page they were bounced off wins; otherwise the dashboard.
      // RequireStaff shows "Access denied" to a signed-in non-staff account.
      const requested = location.state?.from?.pathname;
      navigate(requested || "/", { replace: true });
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
        <Link to="/" className="text-[18px] font-semibold tracking-tight text-ink">
          Arifcard
        </Link>
      </div>

      {/* Heading & Subtitle */}
      <div>
        <h1 className="text-[22px] font-semibold text-ink tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Use the email on your account.
        </p>
      </div>

      {justVerified && !formError && !unverifiedEmail && (
        <p className="mt-4 text-xs text-success">
          Your email is verified. Sign in to continue.
        </p>
      )}

      {justReset && !formError && !unverifiedEmail && (
        <p className="mt-4 text-xs text-success">
          Your password has been updated. Sign in with your new password.
        </p>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {formError && (
          <p role="alert" className="text-xs text-danger">
            {formError}
          </p>
        )}

        {unverifiedEmail && (
          <p role="alert" className="text-xs text-danger">
            This account&apos;s email is not verified. Staff accounts are verified before access is granted.
          </p>
        )}

        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-small font-medium text-ink mb-1.5"
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
            className={`h-11 w-full rounded-lg border bg-surface-1  px-3 text-sm text-ink placeholder:text-ink-muted  transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${
              fieldErrors.email
                ? "border-danger"
                : "border-line-strong  focus:border-accent"
            }`}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-small font-medium text-ink"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-small text-ink-muted hover:text-ink transition-colors"
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
              className={`h-11 w-full rounded-lg border bg-surface-1  px-3 pr-10 text-sm text-ink transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                fieldErrors.password
                  ? "border-danger"
                  : "border-line-strong  focus:border-accent"
              }`}
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
          {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative mt-2 h-11 w-full rounded-lg bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 text-on-accent text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 flex items-center justify-center"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* No sign-up here: staff access is granted on the server only. */}
      <p className="mt-5 text-small text-ink-muted">
        Staff only. Access is granted by an administrator, not requested here.
      </p>
    </div>
  );
}

export default LoginForm;
