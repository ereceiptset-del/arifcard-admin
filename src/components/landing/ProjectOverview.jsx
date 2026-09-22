import { DollarSign } from "lucide-react";

const STATS = [
  {
    value: "100+",
    title: "Total Users",
    subtitle: "Active community members",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
    textGradient: "from-blue-600 to-cyan-600",
    accentGradient: "from-blue-500 to-cyan-500",
    glowGradient: "from-blue-500 to-cyan-500",
    delay: "0ms",
  },
  {
    value: "1K+",
    title: "Happy Users",
    subtitle: "Satisfied customers",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50",
    textGradient: "from-green-600 to-emerald-600",
    accentGradient: "from-green-500 to-emerald-500",
    glowGradient: "from-green-500 to-emerald-500",
    delay: "150ms",
  },
  {
    value: "12K+",
    title: "Services",
    subtitle: "Delivered successfully",
    bgGradient: "from-purple-50 to-fuchsia-50 dark:from-purple-950/50 dark:to-fuchsia-950/50",
    textGradient: "from-purple-600 to-fuchsia-600",
    accentGradient: "from-purple-500 to-fuchsia-500",
    glowGradient: "from-purple-500 to-fuchsia-500",
    delay: "300ms",
  },
];

/**
 * ProjectOverview (Project Highlights at a Glance)
 *
 * Direct match to media_1789718058873.png and yenecard.com:
 * - Top badge: ● Project Overview
 * - Heading: Project Highlights at a Glance (with gradient text)
 * - Subtitle: Key milestones and growth metrics
 * - 3 Highlight Stat Cards (100+ Total Users, 1K+ Happy Users, 12K+ Services)
 *   with shimmer animations, gradient numbers, and hover accent line
 * - Featured business POS showcase image with floating glassmorphic
 *   "Transactions Processed: Over 10M+" badge
 */
export default function ProjectOverview() {
  return (
    <section
      id="project-overview"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 overflow-hidden transition-colors duration-300"
    >
      {/* Background ambient lighting orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-bl from-blue-400/10 to-transparent dark:from-blue-600/8 dark:to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 sm:bottom-40 left-10 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-tr from-indigo-400/10 to-transparent dark:from-indigo-600/8 dark:to-transparent rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-purple-400/5 to-transparent dark:from-purple-600/5 dark:to-transparent rounded-full blur-2xl animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 sm:w-72 sm:h-72 bg-gradient-to-tl from-cyan-400/5 to-transparent dark:from-cyan-600/5 dark:to-transparent rounded-full blur-2xl animate-pulse [animation-delay:3s]" />
      </div>

      {/* Subtle background radial dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #4F46E5 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-14 md:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-[0_2px_16px_rgba(99,102,241,0.12)] text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            Project Overview
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-5 sm:mb-6 px-4 leading-tight tracking-tight">
            Project Highlights{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              at a Glance
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 px-4 max-w-2xl mx-auto leading-relaxed">
            Explore key milestones and achievements of our project, brought to life with real-time counters showcasing our growth, success, and impact. See how we&apos;re delivering results and making a difference through our innovative solutions.
          </p>
        </div>

        {/* 3 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-12 sm:mb-14 md:mb-16">
          {STATS.map((item) => (
            <div
              key={item.title}
              className="group relative bg-white/90 backdrop-blur-sm dark:bg-slate-900/70 rounded-3xl shadow-xl hover:shadow-2xl border border-white/60 dark:border-slate-700/50 transition-all duration-500 overflow-hidden hover:-translate-y-3"
            >
              {/* Subtle colored glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.glowGradient} opacity-0 group-hover:opacity-[0.08] dark:group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.glowGradient} opacity-0 group-hover:opacity-[0.12] blur-xl dark:group-hover:opacity-[0.20] transition-opacity duration-500 pointer-events-none`}
              />

              {/* Shimmer line passing through on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-slate-200/10 pointer-events-none" />

              <div className="relative p-6 sm:p-7 md:p-9 text-center">
                {/* Metric pill badge */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-16 sm:w-22 sm:h-18 md:w-24 md:h-20 bg-gradient-to-br ${item.bgGradient} rounded-3xl mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-500 shadow-md group-hover:shadow-lg`}
                >
                  <span
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-br ${item.textGradient} bg-clip-text text-transparent`}
                  >
                    {item.value}
                  </span>
                </div>

                <h3
                  className={`text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 md:mb-3 group-hover:bg-gradient-to-r ${item.textGradient} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}
                >
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              {/* Bottom expanding accent line */}
              <div
                className={`h-1.5 bg-gradient-to-r ${item.accentGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />
            </div>
          ))}
        </div>

        {/* Featured Showcase Banner */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl group border border-white/50 dark:border-white/10">
            {/* The Checkout Scene Photo */}
            <img
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1600&q=80"
              alt="Arifcard Financial Dashboard and Merchant Checkout"
              className="w-full aspect-[16/10] sm:aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />

            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Corner Decorative Flares matching yenecard.com */}
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-gradient-to-tr from-blue-500/25 to-transparent dark:from-blue-600/20 dark:to-transparent rounded-tr-[4rem] pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-bl from-indigo-500/20 to-transparent dark:from-indigo-600/15 dark:to-transparent rounded-bl-[3rem] pointer-events-none" />

            {/* Floating Glassmorphic Stats Badge in Bottom Left */}
            <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-10 max-w-[calc(100%-24px)] sm:max-w-none">
              <div className="relative bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4 group/badge hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-md -z-10" />

                {/* Dollar Icon Badge */}
                <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 text-white">
                  <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={2.5} />
                  <span className="absolute -inset-1 rounded-lg sm:rounded-xl border border-blue-400/40 animate-ping opacity-50 pointer-events-none" />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  <p className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white/70 leading-tight sm:leading-none mb-0.5 sm:mb-1">
                    Transactions Processed
                  </p>
                  <p className="text-base sm:text-xl font-extrabold text-white leading-none flex items-center">
                    Over 10M<span className="text-blue-300 ml-0.5">+</span>
                  </p>
                  <p className="text-[8px] sm:text-xs text-white/60 leading-tight sm:leading-none mt-0.5 sm:mt-1">
                    transactions processed securely
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
