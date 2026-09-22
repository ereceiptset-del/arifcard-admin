import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, Sparkles, Check } from "lucide-react";

/**
 * Footer
 *
 * Exact match to media_1789718701302.png and yenecard.com:
 * - Dynamic Light/Dark gradient background with ambient orbs and dot pattern
 * - Left column: Arifcard gradient logo, mission statement, "FOLLOW US" social icons
 * - Middle column: "USEFUL LINKS" (Terms of Service, Privacy Policy, AML/KYC Policy)
 * - Right column: Dedicated glassmorphic "Subscribe" card with email input and button
 * - Bottom row: "© 2026 Arifcard. All Rights Reserved." and legal links
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3500);
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/60 to-indigo-50 dark:from-[#0a0a14] dark:via-[#0d0d1f] dark:to-[#0f0a1e] transition-colors duration-300">
      {/* Background ambient lighting orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-600/8" />
        <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl dark:bg-purple-700/10" />

        {/* Subtle dot pattern in light mode */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.035] dark:opacity-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="footer-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#6366f1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-dots)" />
        </svg>
      </div>

      {/* Top subtle gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent dark:via-indigo-400/30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Brand, Mission & Socials (col-span-5) */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight bg-gradient-to-r from-[#00D2FF] via-[#6366F1] to-[#8055FF] bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
                Arifcard
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              Thank you for choosing Arifcard as your trusted partner for secure online transactions. We are committed to providing you with a seamless and secure experience.
            </p>

            {/* Follow Us */}
            <div className="mt-8 flex flex-col items-start gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-black hover:text-white hover:border-black dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Middle Column: Useful Links (col-span-3) */}
          <div className="md:col-span-3 lg:col-span-2">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-4">
              Useful Links
            </h4>
            <ul className="space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <li>
                <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/aml-kyc" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  AML/KYC Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column: Subscribe Card (col-span-5) */}
          <div className="md:col-span-4 lg:col-span-5 w-full">
            <div className="relative rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-[0_10px_35px_rgba(99,102,241,0.06)] dark:shadow-none">
              {/* Three dots decorative indicator */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5 opacity-60 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-500" />
              </div>

              {/* Card Header */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1 pr-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Subscribe
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Stay Connected! Subscribe to Our Latest Feeds – Just Fill Out the Form Below.
                  </p>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubscribe} className="mt-5">
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-1.5 pl-3.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none py-1"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/30 transition-all shrink-0 cursor-pointer"
                  >
                    {subscribed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Subscribed!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Subscribe</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links Bar */}
        <div className="border-t border-slate-200/80 dark:border-white/10 mt-12 sm:mt-16 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © 2026{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Arifcard
            </span>
            . All Rights Reserved.
          </p>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/terms"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              to="/privacy"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              to="/aml-kyc"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              AML/KYC Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
