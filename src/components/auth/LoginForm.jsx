import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { LockKeyhole, ScrollText, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api";
import { loginSchema, validate } from "../../validation/authSchemas";
import { AuthHeading, AuthTextField, AuthPasswordField, AuthSubmit, FormMessage, authLinkClass } from "./AuthFields";
import { FeatureBadgeList } from "./FeatureBadge";

const TRUST = [
  { icon: LockKeyhole, text: "Staff-only sign-in" },
  { icon: UserCheck, text: "Access granted by an administrator" },
  { icon: ShieldCheck, text: "Checked again on every request" },
  { icon: ScrollText, text: "Every action audited" },
];

/**
 * LoginForm — the staff console's /login route (same design as the
 * customer site's sign-in).
 *
 * Opens the dashboard on success. Whether the account is staff is decided
 * by the server; a non-staff account is refused by RequireStaff. There is
 * deliberately no sign-up: staff access is granted on the server only.
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
        setFormError(err instanceof ApiError ? err.message : "We couldn't sign you in. Check your connection and try again.");
      }
      setIsLoading(false);
    }
  };

  const notice = !formError && !unverifiedEmail;

  return (
    <div className="w-full">
      <AuthHeading title="Sign in to the staff console" subtitle="Review identities and payments, issue cards, and keep every decision on record." />

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        {notice && justVerified && <FormMessage tone="success">Your email is verified. Sign in to continue.</FormMessage>}
        {notice && justReset && <FormMessage tone="success">Your password has been updated. Sign in with your new password.</FormMessage>}
        {formError && <FormMessage>{formError}</FormMessage>}
        {unverifiedEmail && <FormMessage>This account&apos;s email is not verified. Staff accounts are verified before access is granted.</FormMessage>}

        <AuthTextField
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <AuthPasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          aside={
            <Link to="/forgot-password" className={`text-small ${authLinkClass} font-medium`}>
              Forgot password?
            </Link>
          }
        />

        <AuthSubmit busy={isLoading} busyLabel="Signing in…">
          Sign in
        </AuthSubmit>
      </form>

      {/* No sign-up here: staff access is granted on the server only. */}
      <p className="mt-6 text-small text-ink-muted">Staff only. Access is granted by an administrator, not requested here.</p>

      <FeatureBadgeList items={TRUST} label="How staff access is protected" className="mt-10 border-t border-line pt-6" />
    </div>
  );
}

export default LoginForm;
