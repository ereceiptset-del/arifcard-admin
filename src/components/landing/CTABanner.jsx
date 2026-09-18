import { Link } from "react-router-dom";

/**
 * CTABanner
 *
 * Closing conversion banner before the footer — dark, on-brand, one
 * clear action.
 */
function CTABanner() {
  return (
    <section className="relative bg-[#070A12] px-6 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#8055FF]/10 to-transparent"
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-white text-balance">
          Ready to spend smarter?
        </h2>
        <p className="mt-3 text-[15px] text-[#8E96A4] leading-relaxed">
          Open your Addiscard wallet today and get a virtual USD card ready to use in minutes.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/register"
            className="w-full sm:w-auto rounded-full bg-[#8055FF] hover:bg-[#7447F8] px-6 py-3 text-sm font-semibold text-white transition-colors text-center"
          >
            Get Addiscard
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto rounded-full border border-white/15 hover:border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors text-center"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;
