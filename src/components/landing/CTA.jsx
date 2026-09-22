import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * CTA
 *
 * Final call-to-action banner before the footer
 */
export default function CTA() {
  return (
    <section className="relative w-full py-20 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#070A12] transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center bg-gradient-to-br from-[#070B15] via-[#0E1322] to-[#17123A] border border-white/10 text-white shadow-2xl">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(128,85,255,0.3)_0%,rgba(34,211,238,0.15)_50%,transparent_75%)] blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Ready for a simpler way to pay online?
            </h2>

            <p className="mt-4 text-base text-gray-300 font-light leading-relaxed">
              Unlock a virtual USD card in minutes. Top up locally in Ethiopian Birr and spend seamlessly anywhere cards are accepted.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-[#070A12] bg-white hover:bg-gray-100 shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                <span>Get Arifcard Now</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
              >
                Sign in to Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
