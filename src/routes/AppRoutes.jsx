import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// From the module, not the package index: this file is on the first-load
// path, and the rest of the component library belongs to the lazy routes.
import { ToastProvider } from "@addiscard/ui/components/Toast.jsx";
import RequireStaff from "../components/auth/RequireStaff";

// Sign-in screens (no sign-up: staff access is granted on the server only).
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));

// The console.
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const OverviewPage = lazy(() => import("../pages/admin/OverviewPage"));
const CustomersPage = lazy(() => import("../pages/admin/CustomersPage"));
const CardOperationsPage = lazy(() => import("../pages/admin/CardOperationsPage"));
const PaymentsPage = lazy(() => import("../pages/admin/PaymentsPage"));
const SettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
const TransactionsPage = lazy(() => import("../pages/admin/TransactionsPage"));
const NotificationsPage = lazy(() => import("../pages/admin/NotificationsPage"));
const AuditLogPage = lazy(() => import("../pages/admin/AuditLogPage"));
const KycQueuePage = lazy(() => import("../pages/admin/KycQueuePage"));
const KycCasePage = lazy(() => import("../pages/admin/KycCasePage"));

/**
 * Links written for the old combined site (`/admin/kyc/123?status=…`) keep
 * working: the `/admin` prefix is dropped, the rest of the path and the
 * query are kept. Only a path inside this app — never another host.
 */
function LegacyAdminPath() {
  const { pathname, search } = useLocation();
  const rest = pathname.replace(/^\/admin\/?/, "/");
  return <Navigate to={`${rest}${search}`} replace />;
}

/**
 * Admin route table. This site serves staff only; the server re-checks
 * staff status and role on every request, so this table decides only what
 * is shown, never what is allowed.
 */
function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-[#080C16]">
          <div className="w-8 h-8 rounded-full border-2 border-[#8055FF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage defaultStep="reset" />} />
        </Route>

        <Route
          path="/"
          element={
            <RequireStaff>
              <ToastProvider>
                <AdminLayout />
              </ToastProvider>
            </RequireStaff>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="cards" element={<CardOperationsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="kyc" element={<KycQueuePage />} />
          <Route path="kyc/:caseId" element={<KycCasePage />} />
          {/* Card orders and cards are one screen now: Card operations. */}
          <Route path="card-orders" element={<Navigate to="/cards" replace />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/admin/*" element={<LegacyAdminPath />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
