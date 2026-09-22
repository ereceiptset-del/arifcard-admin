import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

/**
 * ForgotPasswordPage
 *
 * Route: /forgot-password — nested under the AuthLayout layout route,
 * which supplies the persistent left product panel and the animated
 * form slot.
 */
function ForgotPasswordPage({ defaultStep }) {
  return <ForgotPasswordForm defaultStep={defaultStep} />;
}

export default ForgotPasswordPage;
