import { Star, Quote } from "lucide-react";

const TESTIMONIALS_DATA = [
  {
    id: "aisha",
    quote:
      "We are at the forefront of revolutionizing the way people navigate the digital financial landscape. Our mission is clear: to provide users and entrepreneurs with a secure, efficient, and user-friendly platform for conducting online transactions through virtual credit cards.",
    name: "Aisha Patel",
    role: "Freelance Graphic Designer",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "james",
    quote:
      "As a small business owner, Arifcard has been a game-changer. It allows me to offer convenient payment options to my clients while generating an extra revenue stream. The one-time-use codes provide peace of mind, knowing that my transactions are secure. Arifcard is a win-win for both my clients and my business.",
    name: "James Carter",
    role: "E-commerce Entrepreneur",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "lena",
    quote:
      "Shopping online has never been this secure and straightforward. Arifcard's unique codes make me feel confident about the safety of my transactions. It's like having an extra layer of protection. I can't imagine going back to using my regular card for online purchases. Arifcard has won me over!",
    name: "Lena Moreau",
    role: "Digital Nomad & Content Creator",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
];

/**
 * Testimonials (What Our Users Are Saying)
 *
 * Exact match to media_1789719674793.png and yenecard.com:
 * - Eyebrow pill: ● What Our Users Are Saying
 * - Centered heading with gradient accent: "Explore what our satisfied users have to say about their experiences with it."
 * - Subtitle narrative
 * - 3 Quote Cards with blue quote emblem, 5 gold stars, user quotes, and author avatars
 * - Centered summary pill: "10,000+ Happy Users" & "4.9/5 Average Rating"
 */
export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#080C16] dark:via-[#0D1220] dark:to-[#111827] transition-colors duration-300"
    >
      {/* Background ambient lighting orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-indigo-400/8 to-transparent dark:from-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-blue-400/8 to-transparent dark:from-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-[0_2px_16px_rgba(99,102,241,0.1)] text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            What Our Users Are Saying
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            Explore what our satisfied users have to say about{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              their experiences
            </span>{" "}
            with it.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            We are at the forefront of revolutionizing the way people navigate the digital financial landscape. Our mission is clear: to provide users and entrepreneurs with a secure, efficient, and user-friendly platform for conducting online transactions through virtual credit cards.
          </p>
        </div>

        {/* 3 Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS_DATA.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white/95 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(99,102,241,0.12)] border border-slate-200/80 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                {/* Blue Quote Icon Emblem */}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-5 group-hover:scale-110 transition-transform">
                  <Quote className="w-5 h-5 fill-current" />
                </div>

                {/* 5 Solid Gold Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500/20 shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Rating Summary Pill */}
        <div className="mt-14 sm:mt-16 flex justify-center">
          <div className="inline-flex items-center gap-6 sm:gap-8 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-lg">
            {/* Left Counter */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                10,000+
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Happy Users
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-9 bg-slate-200 dark:bg-slate-800" />

            {/* Right Rating */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                4.9/5 Average Rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
