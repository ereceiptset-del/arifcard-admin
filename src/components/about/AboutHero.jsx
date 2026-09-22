import { Target, Sparkles, ShieldCheck, Users } from "lucide-react";

const FEATURE_PILLS = [
  {
    icon: Target,
    label: "Our Vision",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
  },
  {
    icon: Sparkles,
    label: "The Arifcard Difference",
    iconBg: "bg-[#7F3DFF]",
    iconColor: "text-white",
  },
  {
    icon: ShieldCheck,
    label: "Our Commitment",
    iconBg: "bg-emerald-500",
    iconColor: "text-white",
  },
  {
    icon: Users,
    label: "Join Us on this Journey",
    iconBg: "bg-[#9333EA]",
    iconColor: "text-white",
  },
];

const BRAND_TILES = [
  // Row 1
  {
    id: "hulu",
    content: (
      <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1CE783]">
        hulu
      </span>
    ),
  },
  {
    id: "playstation",
    content: (
      <div className="flex items-center gap-1 text-[#00439C] dark:text-[#0070D1]">
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M12.012 1.482c-1.25 0-2.348.804-2.736 1.996L6.594 11.75c-.324.992.42 2.012 1.464 2.012h1.614v3.52c0 1.25.992 2.25 2.238 2.25s2.238-1 2.238-2.25V3.732c0-1.25-.992-2.25-2.238-2.25h.102zm2.97 7.746l3.52 1.464c1.15.48 1.464 1.996.634 2.894l-2.43 2.628c-.732.79-1.996.53-2.386-.48l-1.574-4.044a1.5 1.5 0 011.026-1.974l1.21-.488z" />
        </svg>
      </div>
    ),
  },
  {
    id: "shein",
    content: (
      <span className="text-base sm:text-lg font-black tracking-widest text-white">
        SHEIN
      </span>
    ),
  },
  {
    id: "soundcloud",
    content: (
      <div className="flex items-center gap-1 text-[#FF5500]">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M11.56 8.87V17h9.09c1.85 0 3.35-1.5 3.35-3.35 0-1.78-1.39-3.23-3.14-3.34-.33-2.61-2.55-4.64-5.26-4.64-1.87 0-3.51.97-4.45 2.45-.19-.07-.39-.12-.6-.12-.34 0-.66.1-.94.27z" />
        </svg>
        <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-white">
          SOUNDCLOUD
        </span>
      </div>
    ),
  },

  // Row 2
  {
    id: "prime",
    content: (
      <div className="flex flex-col items-center">
        <span className="text-lg sm:text-xl font-black italic tracking-tighter text-white">
          prime
        </span>
        <svg viewBox="0 0 36 8" className="w-10 h-2 fill-none stroke-[#00A8E1] stroke-2">
          <path d="M2 3 Q 18 9 34 2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    id: "duolingo",
    content: (
      <div className="flex items-center gap-1.5 text-[#58CC02]">
        <span className="w-3.5 h-3.5 rounded-full bg-[#58CC02]" />
        <span className="text-sm sm:text-base font-black tracking-tight text-[#58CC02]">
          duolingo
        </span>
      </div>
    ),
  },
  {
    id: "googleplay",
    content: (
      <div className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M3.6 1.8l10.4 10.4-10.4 10.4c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" />
          <path fill="#34A853" d="M17.8 8.4L4.8 1.1c-.4-.2-.8-.3-1.2-.3l10.4 10.4 3.8-2.8z" />
          <path fill="#EA4335" d="M17.8 15.6l-3.8-2.8L3.6 23.2c.4 0 .8-.1 1.2-.3l13-7.3z" />
          <path fill="#FBBC04" d="M21.5 12c0-.5-.3-1-.7-1.2l-3 1.7 3 1.7c.4-.2.7-.7.7-1.2z" />
        </svg>
        <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight">
          Google play
        </span>
      </div>
    ),
  },
  {
    id: "netflix",
    content: (
      <span className="text-base sm:text-lg font-black tracking-wider text-[#E50914] uppercase">
        NETFLIX
      </span>
    ),
  },

  // Row 3
  {
    id: "spotify",
    content: (
      <div className="flex items-center gap-1.5 text-[#1DB954]">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.792-.963-.335.077-.67-.133-.746-.468-.077-.335.132-.67.467-.746 3.808-.87 7.076-.496 9.72 1.113.295.18.388.563.208.857zm1.226-2.724c-.226.367-.708.482-1.075.257-2.69-1.654-6.79-2.135-9.97-1.17-.413.125-.85-.11-.975-.523-.125-.413.11-.85.523-.975 3.633-1.102 8.15-.568 11.24 1.336.367.226.482.708.257 1.075zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.495.15-1.02-.13-1.17-.624-.15-.496.13-1.02.625-1.17 3.535-1.073 9.404-.87 13.12 1.337.445.264.59.843.327 1.288-.264.444-.843.59-1.288.326z" />
        </svg>
        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
          Spotify
        </span>
      </div>
    ),
  },
  {
    id: "suno",
    content: (
      <div className="flex items-center gap-1.5 text-white">
        <span className="text-base sm:text-lg font-black tracking-tight">
          ~ Suno
        </span>
      </div>
    ),
  },
  {
    id: "alibaba",
    content: (
      <div className="flex items-center gap-1">
        <span className="text-base sm:text-lg font-black italic text-[#FF6A00]">
          a
        </span>
        <span className="text-[11px] sm:text-xs font-bold text-[#FF6A00] tracking-tight">
          Alibaba.com
        </span>
      </div>
    ),
  },
  {
    id: "amazon-music",
    content: (
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-black tracking-tight text-[#00A8E1]">
          music
        </span>
        <svg viewBox="0 0 28 6" className="w-8 h-1.5 fill-none stroke-[#00A8E1] stroke-2">
          <path d="M2 2 Q 14 6 26 2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },

  // Row 4
  {
    id: "ethiopian",
    content: (
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="w-2.5 h-1 bg-emerald-500 rounded-xs" />
          <div className="w-2.5 h-1 bg-yellow-400 rounded-xs" />
          <div className="w-2.5 h-1 bg-red-500 rounded-xs" />
        </div>
        <span className="text-[10.5px] sm:text-xs font-bold text-white tracking-tight">
          Ethiopian
        </span>
      </div>
    ),
  },
  {
    id: "facebook-ads",
    content: (
      <div className="flex items-center gap-1 text-white">
        <span className="text-xs sm:text-sm font-bold tracking-tight text-[#1877F2]">
          facebook
        </span>
        <span className="text-xs font-medium text-slate-300">Ads</span>
      </div>
    ),
  },
  {
    id: "amazon",
    content: (
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-bold tracking-tight text-white">
          amazon
        </span>
        <svg viewBox="0 0 32 6" className="w-8 h-1.5 fill-none stroke-[#FF9900] stroke-2">
          <path d="M2 2 Q 16 6 30 2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    id: "pubg",
    content: (
      <div className="px-1.5 py-0.5 rounded border border-[#F5A623]/60 bg-[#F5A623]/10">
        <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#F5A623]">
          PUBG
        </span>
      </div>
    ),
  },
];

/**
 * AboutHero Section
 *
 * Direct match to media_1789719674732.png:
 * - Top badge: ● About Us
 * - Header: Empowering the Future of Online Transactions (with gradient)
 * - Narrative mission statement
 * - 2x2 Feature pills (Our Vision, The Arifcard Difference, Our Commitment, Join Us)
 * - 4x4 Global Brands logo grid (16 dark navy tiles)
 */
export default function AboutHero() {
  return (
    <section
      id="about-us"
      className="relative w-full pt-32 sm:pt-36 lg:pt-40 pb-20 sm:pb-24 lg:pb-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#080C16] dark:via-[#0D1220] dark:to-[#111827] transition-colors duration-300"
    >
      {/* Background ambient lighting orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-transparent dark:from-blue-500/8 dark:via-indigo-500/4 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-gradient-to-tl from-purple-400/10 via-violet-400/5 to-transparent dark:from-purple-500/8 dark:via-violet-500/4 dark:to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column (col-span-6): Heading, Story & Feature Pills */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-[0_2px_16px_rgba(99,102,241,0.1)] text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              About Us
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Empowering the Future of{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                Online Transactions
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              We are at the forefront of revolutionizing the way people navigate the digital financial landscape. Our mission is clear: to provide users and entrepreneurs with a secure, efficient, and user-friendly platform for conducting online transactions through virtual credit cards.
            </p>

            {/* 2x2 Feature Pills */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              {FEATURE_PILLS.map((pill) => {
                const Icon = pill.icon;
                return (
                  <div
                    key={pill.label}
                    className="rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 p-3.5 sm:p-4 flex items-center gap-3.5 transition-all duration-300 cursor-pointer group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${pill.iconBg} ${pill.iconColor} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {pill.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (col-span-6): 4x4 Global Brands Logo Grid */}
          <div className="lg:col-span-6 w-full">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 p-3 sm:p-5 rounded-3xl bg-slate-900/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/5 shadow-2xl">
              {BRAND_TILES.map((tile) => (
                <div
                  key={tile.id}
                  className="rounded-2xl bg-[#0B101E] border border-white/5 hover:border-indigo-500/40 p-2 sm:p-3 flex items-center justify-center h-16 sm:h-20 shadow-md hover:scale-105 hover:shadow-indigo-500/20 transition-all duration-300 cursor-default select-none group"
                >
                  <div className="transform transition-transform group-hover:scale-110">
                    {tile.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
