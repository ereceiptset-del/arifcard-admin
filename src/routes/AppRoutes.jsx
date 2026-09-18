import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/landing/LandingPage";
import AboutPage from "../pages/about/AboutPage";
import ServicesPage from "../pages/services/ServicesPage";
import AnnouncementPage from "../pages/announcement/AnnouncementPage";
import ContactPage from "../pages/contact/ContactPage";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyPage from "../pages/auth/VerifyPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

/**
 * Central route table.
 *
 * The marketing pages (/, /about, /services, /announcement, /contact) each
 * render their own MarketingLayout independently — unlike the auth routes,
 * they don't share a layout route, since there's no persistent element
 * (like the auth panel) that needs to survive navigation between them.
 *
 * The four auth routes are nested under the AuthLayout layout route so the
 * layout (and its left product panel) mounts once and persists while React
 * Router swaps only the nested page via <Outlet />.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/announcement" element={<AnnouncementPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
