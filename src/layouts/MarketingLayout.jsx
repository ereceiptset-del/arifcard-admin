import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

/**
 * MarketingLayout
 *
 * Shared shell for every public marketing page (landing, about, services,
 * announcements, contact) — the floating Navbar and Footer, with page
 * content slotted between them.
 */
function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070B15] transition-colors duration-200">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default MarketingLayout;
