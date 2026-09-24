import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider as UiThemeProvider, ToastProvider } from "@addiscard/ui";

// Marketing pages are lazy-loaded so each page can be downloaded
// only when the user navigates to that route.
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const ServicesPage = lazy(() => import("../pages/services/ServicesPage"));
const AnnouncementPage = lazy(() => import("../pages/announcement/AnnouncementPage"));
const ContactPage = lazy(() => import("../pages/contact/ContactPage"));

// Authentication layout and pages are also split into separate chunks.
// This prevents all authentication code from being included in the
// initial JavaScript bundle.
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const VerifyPage = lazy(() => import("../pages/auth/VerifyPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));

// Signed-in areas.
const CustomerLayout = lazy(() => import("../layouts/CustomerLayout"));
const CustomerHomePage = lazy(() => import("../pages/customer/HomePage"));
const CustomerWalletPage = lazy(() => import("../pages/customer/WalletPage"));
const CustomerCardsPage = lazy(() => import("../pages/customer/CardsPage"));
const CustomerSettingsPage = lazy(() => import("../pages/customer/SettingsPage"));
const CustomerVerificationPage = lazy(() => import("../pages/customer/VerificationPage"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminOverviewPage = lazy(() => import("../pages/admin/OverviewPage"));
const AdminCustomersPage = lazy(() => import("../pages/admin/CustomersPage"));
const AdminCardsPage = lazy(() => import("../pages/admin/CardsPage"));
const AdminPaymentsPage = lazy(() => import("../pages/admin/PaymentsPage"));
const AdminSettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
const AdminTransactionsPage = lazy(() => import("../pages/admin/TransactionsPage"));
const AdminNotificationsPage = lazy(() => import("../pages/admin/NotificationsPage"));
const AdminAuditLogPage = lazy(() => import("../pages/admin/AuditLogPage"));
const AdminCardOrdersPage = lazy(() => import("../pages/admin/CardOrdersPage"));
const AdminKycQueuePage = lazy(() => import("../pages/admin/KycQueuePage"));
const AdminKycCasePage = lazy(() => import("../pages/admin/KycCasePage"));

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RequireStaff from "../components/auth/RequireStaff";

/**
 * Central route table.
 *
 * Two signed-in areas live in this one app: `/customer` and `/admin`.
 * Both are built on the shared components in `packages/ui`, which need two
 * providers of their own — the theme (sharing a storage key with the site's
 * ThemeContext, so the two stay on the same light/dark setting) and toasts.
 * The marketing and auth pages use neither, so both are mounted on these
 * subtrees rather than around the whole app.
 *
 * Pages are lazy-loaded using React.lazy() so Vite can create separate
 * JavaScript chunks for each route.
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
        {/* Public marketing pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/announcement" element={<AnnouncementPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Public auth pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ForgotPasswordPage defaultStep="reset" />} />
        </Route>

        {/* Signed-in customer area */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <UiThemeProvider>
                <ToastProvider>
                  <CustomerLayout />
                </ToastProvider>
              </UiThemeProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerHomePage />} />
          <Route path="wallet" element={<CustomerWalletPage />} />
          <Route path="cards" element={<CustomerCardsPage />} />
          <Route path="verification" element={<CustomerVerificationPage />} />
          <Route path="settings" element={<CustomerSettingsPage />} />
        </Route>

{/*
          Signed-in admin area.

          Guarded by RequireStaff *alone*, deliberately. ProtectedRoute
          guards the customer area, and part of what it does there is send
          staff away to /admin — so wrapping it around /admin as well made
          the route redirect to itself forever: Navigate to /admin,
          remount, still staff, Navigate to /admin. React Router unwinds
          that loop by rendering nothing, which is why signing in as the
          owner produced a blank white page and no error anyone could see.

          RequireStaff already answers every question ProtectedRoute would
          here — still loading, not signed in, signed in but not staff —
          so nothing is lost by removing it.
        */}
        <Route
          path="/admin"
          element={
            <RequireStaff>
              <UiThemeProvider>
                <ToastProvider>
                  <AdminLayout />
                </ToastProvider>
              </UiThemeProvider>
            </RequireStaff>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="cards" element={<AdminCardsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="kyc" element={<AdminKycQueuePage />} />
          <Route path="kyc/:caseId" element={<AdminKycCasePage />} />
          <Route path="card-orders" element={<AdminCardOrdersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="audit" element={<AdminAuditLogPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* The old dashboard path, kept working as a redirect. */}
        <Route path="/dashboard/*" element={<Navigate to="/customer" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
