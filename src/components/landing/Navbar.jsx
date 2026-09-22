import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

/**
 * Navbar
 *
 * Exact match to https://yenecard.com/ and reference screenshots:
 * - Floating pill shape (`rounded-full`) with frosted backdrop blur
 * - Gradient brand wordmark: Arifcard (Cyan to Purple)
 * - Navigation links: Home, About, Services, Announcement
 * - Utilities: Contact, Language selector (EN), Theme switch (Moon/Sun)
 * - Divider and Auth buttons: bordered "Login" and gradient purple "Register"
 * - Responsive mobile drawer navigation
 */
export default function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3 sm:py-3.5 pointer-events-none">
      {/* Floating Pill Container */}
      <nav
        className={`pointer-events-auto flex items-center justify-between w-full max-w-[1220px] h-[58px] sm:h-[60px] px-5 sm:px-6 rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 dark:bg-[#1E293B]/80 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(99,102,241,0.12),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
            : "bg-white/70 dark:bg-[#1E293B]/60 border border-white/50 dark:border-white/10 shadow-[0_4px_24px_rgba(99,102,241,0.08),0_1.5px_6px_rgba(0,0,0,0.04)] backdrop-blur-xl"
        }`}
      >
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl sm:text-[22px] font-extrabold tracking-tight bg-gradient-to-r from-[#00D2FF] via-[#6366F1] to-[#8055FF] bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
            Arifcard
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className="px-3.5 py-1.5 rounded-full text-[14.5px] font-medium text-[#374151] dark:text-[#D1D5DB] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="px-3.5 py-1.5 rounded-full text-[14.5px] font-medium text-[#374151] dark:text-[#D1D5DB] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
          >
            About
          </Link>
          <Link
            to="/services"
            className="px-3.5 py-1.5 rounded-full text-[14.5px] font-medium text-[#374151] dark:text-[#D1D5DB] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
          >
            Services
          </Link>
          <Link
            to="/announcement"
            className="px-3.5 py-1.5 rounded-full text-[14.5px] font-medium text-[#374151] dark:text-[#D1D5DB] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
          >
            Announcement
          </Link>
        </div>

        {/* Right Desktop Utilities & Auth */}
        <div className="hidden md:flex items-center gap-2 xl:gap-3">
          {/* Contact link */}
          <Link
            to="/contact"
            className="px-2.5 py-1 rounded-full text-[13px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
          >
            Contact
          </Link>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[13px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-colors"
              aria-label="Select language"
            >
              <Globe size={15} />
              <span className="text-[12px] font-semibold uppercase tracking-wider">{currentLang}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 rounded-2xl bg-white/95 dark:bg-[#162137]/95 border border-white/40 dark:border-white/10 shadow-xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {["EN", "AM"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setCurrentLang(lang);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                      currentLang === lang
                        ? "bg-[#6366F1]/15 text-[#4F46E5] dark:text-[#818CF8]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    {lang === "EN" ? "English (EN)" : "Amharic (AM)"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#6366F1]/10 transition-all hover:scale-105"
          >
            {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Thin Vertical Divider */}
          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/15 my-auto" />

          {isAuthenticated ? (
            <Link
              to="/customer"
              className="px-4.5 py-1.5 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#8055FF] to-[#6366F1] hover:from-[#7447F8] hover:to-[#4F46E5] shadow-[0_2px_12px_rgba(128,85,255,0.35)] hover:shadow-[0_4px_18px_rgba(128,85,255,0.45)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {/* Login Button */}
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] border border-black/15 dark:border-white/15 hover:border-[#4F46E5] hover:text-[#4F46E5] dark:hover:border-[#818CF8] dark:hover:text-[#818CF8] transition-all whitespace-nowrap"
              >
                Login
              </Link>

              {/* Register Button */}
              <Link
                to="/register"
                className="px-4.5 py-1.5 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] shadow-[0_2px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_18px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] dark:text-[#9CA3AF]"
          >
            {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-black/15 dark:border-white/15 text-[#374151] dark:text-[#D1D5DB]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto fixed inset-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-2xl flex flex-col pt-24 px-6 pb-8 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
            >
              About
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
            >
              Services
            </Link>
            <Link
              to="/announcement"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
            >
              Announcement
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6] rounded-xl hover:bg-[#6366F1]/10 transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-black/10 dark:border-white/10">
            {isAuthenticated ? (
              <Link
                to="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 text-center text-[15px] font-semibold text-white rounded-full bg-gradient-to-r from-[#8055FF] to-[#6366F1] shadow-[0_4px_20px_rgba(128,85,255,0.35)]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-[15px] font-semibold text-[#374151] dark:text-[#D1D5DB] rounded-full border border-black/15 dark:border-white/15"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-center text-[15px] font-semibold text-white rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-[0_4px_20px_rgba(99,102,241,0.35)]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
