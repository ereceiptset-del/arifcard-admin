import { Link } from "react-router-dom";
import { ShieldCheck, Zap, Star, TrendingUp } from "lucide-react";

/**
 * Hero
 *
 * Exact match to https://yenecard.com/ and the provided Light Mode screenshot:
 * - Soft ethereal lavender/cyan gradient background with floating blurred orbs & outline rings
 * - Status badge: ● LIVE • Virtual Card Infrastructure
 * - Main headline: "Unveiling the Virtual Card Experience" with vibrant Cyan-to-Purple gradient
 * - Subtitle describing online platform spending (AliExpress, Netflix, Meta/Google ads, Amazon)
 * - Dark pill CTA: "Apply Virtual Card"
 * - 4 floating fintech trust badges (Secure, +24% Growth, Top Rated, Instant)
 * - Showcase Addiscard Pro Virtual Card peeking upward at the bottom with contactless icon, chip, and VISA badge
 */
export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 sm:pt-36 pb-12 px-6 sm:px-8 flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#F2F1FD] via-[#F8F9FE] to-white dark:from-[#070A12] dark:via-[#0A0E1A] dark:to-[#070A12] transition-colors duration-300">
      {/* Background Soft Pastel Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Left Cyan/Blue Glow */}
        <div className="absolute top-[10%] -left-[10%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25)_0%,rgba(99,102,241,0.12)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(34,211,238,0.15)_0%,rgba(99,102,241,0.08)_45%,transparent_70%)] blur-[90px]" />
        
        {/* Right Lavender/Purple Glow */}
        <div className="absolute top-[5%] -right-[10%] w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.25)_0%,rgba(99,102,241,0.15)_45%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,rgba(99,102,241,0.08)_45%,transparent_70%)] blur-[90px]" />

        {/* Center Card Highlight Glow */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[500px] h-[320px] rounded-full bg-[radial-gradient(ellipse,rgba(99,102,241,0.22)_0%,rgba(34,211,238,0.12)_50%,transparent_75%)] blur-[60px]" />

        {/* Subtle Decorative Floating Outline Rings */}
        <div className="absolute top-[20%] left-[8%] w-6 h-6 rounded-full border border-indigo-300/40 dark:border-indigo-500/20" />
        <div className="absolute top-[35%] right-[9%] w-8 h-8 rounded-full border border-purple-300/40 dark:border-purple-500/20" />
        <div className="absolute top-[65%] left-[6%] w-10 h-10 rounded-full border border-cyan-300/40 dark:border-cyan-500/20" />
        <div className="absolute bottom-[20%] right-[7%] w-5 h-5 rounded-full border border-indigo-300/40 dark:border-indigo-500/20" />
      </div>

      {/* Main Hero Header & Copy */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center mt-2">
        {/* Live Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#6366F1]/20 bg-[#6366F1]/5 dark:bg-white/5 dark:border-white/10 text-[11px] font-mono tracking-wider text-[#4F46E5] dark:text-[#A5B4FC] mb-7 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>LIVE • Virtual Card Infrastructure</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[74px] font-extrabold tracking-tight leading-[1.06] text-[#0F172A] dark:text-white">
          <span className="block">Unveiling the</span>
          <span className="block bg-gradient-to-r from-[#00D2FF] via-[#6366F1] to-[#7C3AED] bg-clip-text text-transparent">
            Virtual Card
          </span>
          <span className="block mt-[-2px]">Experience</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-[17px] text-[#4B5563] dark:text-[#9CA3AF] max-w-xl mx-auto leading-relaxed font-normal">
          The payment needs of major online giants such as AliExpress, Netflix, Facebook-Google Advertising, Amazon, and various other shopping platforms.
        </p>

        {/* Dark Primary Action CTA */}
        <div className="mt-8">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[14.5px] font-semibold text-white bg-[#0F172A] dark:bg-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-gray-100 shadow-[0_8px_24px_rgba(15,23,42,0.25)] hover:scale-105 active:scale-95 transition-all"
          >
            Apply Virtual Card
          </Link>
        </div>
      </div>

      {/* Centerpiece Floating Showcase Card with 4 Surrounding Trust Badges */}
      <div className="relative z-10 w-full max-w-[540px] flex flex-col items-center justify-center mt-12 sm:mt-16">
        {/* Floating Trust Badge 1 - Top Left: Secure */}
        <div className="hidden sm:flex absolute -left-12 lg:-left-20 -top-16 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#131B2E]/90 border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="text-left">
            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white">Secure</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">SSL Protected</div>
          </div>
        </div>

        {/* Floating Trust Badge 2 - Top Right: Growth */}
        <div className="hidden sm:flex absolute -right-12 lg:-right-20 -top-12 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#131B2E]/90 border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="text-left">
            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white">+24% Growth</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Monthly Users</div>
          </div>
        </div>

        {/* Floating Trust Badge 3 - Middle Left: Top Rated */}
        <div className="hidden sm:flex absolute -left-16 lg:-left-24 top-14 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#131B2E]/90 border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={18} />
          </div>
          <div className="text-left">
            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white">Top Rated</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">4.9 Stars</div>
          </div>
        </div>

        {/* Floating Trust Badge 4 - Middle Right: Instant */}
        <div className="hidden sm:flex absolute -right-16 lg:-right-24 top-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#131B2E]/90 border border-white/90 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition-transform hover:-translate-y-1">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 shrink-0">
            <Zap size={18} />
          </div>
          <div className="text-left">
            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white">Instant</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Activation</div>
          </div>
        </div>

        {/* Addiscard Pro Virtual Card (Showcase Edition from Reference Screenshot) */}
        <div className="relative w-[340px] sm:w-[370px] h-[215px] sm:h-[225px] rounded-[20px] p-5 sm:p-6 flex flex-col justify-between select-none bg-gradient-to-br from-[#0D0B22] via-[#16124A] to-[#090717] border border-[#8B5CF6]/30 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_36px_rgba(99,102,241,0.25)] text-white hover:scale-[1.02] transition-transform duration-300">
          {/* Top Row: Wordmark & Contactless Icon */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-indigo-200/90 font-mono">
                ADDISCARD PRO
              </p>
              <p className="text-[9px] tracking-widest uppercase text-indigo-300/50 mt-0.5">
                Virtual Card
              </p>
            </div>
            
            {/* Contactless Waves SVG Icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-indigo-300/70">
              <path d="M 4.7 6.5 A 9 9 0 0 1 17.3 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 6.8 8 A 6 6 0 0 1 15.2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
              <path d="M 8.9 9.5 A 3 3 0 0 1 13.1 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>

          {/* Microchip SVG */}
          <div className="my-1">
            <svg width="38" height="28" viewBox="0 0 40 30" fill="none">
              <rect x="1" y="1" width="38" height="28" rx="5" fill="#7C3AED" stroke="#C4B5FD" strokeWidth="0.8" />
              <rect x="7" y="7" width="26" height="16" rx="2.5" fill="#A78BFA" />
              <line x1="14" y1="1" x2="14" y2="7" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="14" y1="23" x2="14" y2="29" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="20" y1="1" x2="20" y2="7" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="20" y1="23" x2="20" y2="29" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="26" y1="1" x2="26" y2="7" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="26" y1="23" x2="26" y2="29" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="1" y1="15" x2="7" y2="15" stroke="#C4B5FD" strokeWidth="1.1" />
              <line x1="33" y1="15" x2="39" y2="15" stroke="#C4B5FD" strokeWidth="1.1" />
              <rect x="11" y="10" width="18" height="10" rx="2" fill="#7C3AED" />
            </svg>
          </div>

          {/* Card Number */}
          <div>
            <p className="text-[13.5px] font-mono tracking-[0.24em] text-indigo-100/90">
              5312 •••• •••• 7842
            </p>
          </div>

          {/* Bottom Row: Metadata & VISA Badge */}
          <div className="flex items-end justify-between text-left">
            <div>
              <p className="text-[8px] uppercase tracking-wider text-indigo-300/60">Card Holder</p>
              <p className="text-[11px] uppercase tracking-wide text-indigo-100/90 font-medium">Alex Morgan</p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-wider text-indigo-300/60">Valid</p>
              <p className="text-[11px] text-indigo-100/90 font-mono">11/30</p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-wider text-indigo-300/60">CVV</p>
              <p className="text-[11px] text-indigo-100/90 font-mono">•••</p>
            </div>
            <div className="px-2.5 py-0.5 rounded border border-indigo-300/30 bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
              <span className="text-[12px] font-extrabold tracking-wider text-white font-mono">VISA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
