import VerifyForm from "../../components/auth/VerifyForm";

/**
 * VerifyPage
 *
 * Route: /verify?email=... — nested under the AuthLayout layout route,
 * which supplies the persistent left product panel and the animated
 * form slot.
 */
function VerifyPage() {
  return <VerifyForm />;
}

export default VerifyPage;
