import { CreditCard, Lock, CircleDollarSign, BarChart3, Globe, LifeBuoy } from "lucide-react";

const FEATURES = [
  {
    title: "Virtual Card Issuance",
    description:
      "Instantly create and manage virtual cards for secure online transactions, customized to suit your specific needs.",
    icon: CreditCard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Secure Online Transactions",
    description:
      "Benefit from advanced encryption and authentication methods, ensuring that your online payments are protected.",
    icon: Lock,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Customizable Payment Plans",
    description:
      "Choose from a variety of flexible payment plans designed to accommodate different budgets and preferences.",
    icon: CircleDollarSign,
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Real-Time Transaction Monitoring",
    description:
      "Keep track of your spending with real-time notifications and detailed transaction history.",
    icon: BarChart3,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Multi-Currency Support",
    description:
      "Easily manage transactions in multiple currencies, perfect for international shopping and payments.",
    icon: Globe,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "24/7 Customer Support",
    description:
      "Access round-the-clock customer support to resolve any payment-related issues or inquiries.",
    icon: LifeBuoy,
    gradient: "from-indigo-500 to-violet-500",
  },
];

/**
 * WhyChooseUs Section
 *
 * Direct match to media_1789717310073.png & yenecard.com:
 * - Top pill tag: ● Why Choose Us
 * - Header: What Makes Us Your Best Choice (with gradient accents)
 * - Subtitle describing user-first commitment, security, and excellence
 * - 6-card grid with vibrant gradients, custom lucide icons, hover glow & lift
 */
export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#080C16] dark:via-[#0D1220] dark:to-[#111827] transition-colors duration-300"
    >
      {/* Background ambient lighting orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-transparent dark:from-blue-500/8 dark:via-indigo-500/4 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-gradient-to-tl from-violet-400/10 via-purple-400/5 to-transparent dark:from-violet-500/8 dark:via-purple-500/4 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-cyan-400/8 to-transparent dark:from-cyan-500/5 dark:to-transparent rounded-full blur-3xl" />
      </div>

      {/* Subtle background cross/plus pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header Section */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-[0_2px_16px_rgba(99,102,241,0.1)] text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            Why Choose Us
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 sm:mb-6 leading-tight tracking-tight">
            What Makes Us Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Best Choice
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover why we stand out with unparalleled services, innovative solutions, and a commitment to excellence. Our user-first approach ensures reliability, security, and satisfaction, making us the trusted choice for all your needs.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {FEATURES.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="group relative bg-white/90 dark:bg-slate-900/75 backdrop-blur-md rounded-3xl p-7 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(99,102,241,0.12)] border border-white/80 dark:border-slate-800/80 transition-all duration-500 overflow-hidden hover:-translate-y-2 flex items-center gap-5 sm:gap-6"
              >
                {/* Ambient card hover glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none`}
                />
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none`}
                />

                {/* Left Icon Badge */}
                <div className="shrink-0">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl opacity-25 blur-lg group-hover:blur-xl group-hover:opacity-40 transition-all duration-500`}
                    />
                    <div
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500`}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Right Text Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-lg sm:text-[19px] font-bold text-slate-900 dark:text-slate-100 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-[14.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Bottom accent indicator bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
