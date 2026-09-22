import { Link } from "react-router-dom";
import { CreditCard, Wallet, ArrowRightLeft, RefreshCw, Fingerprint, Receipt, Globe } from "lucide-react";

const SERVICES_DATA = [
  {
    number: "01",
    tag: "Cards",
    tagColor: "text-blue-500 bg-blue-500/10",
    accentColor: "from-blue-500 to-cyan-500",
    icon: CreditCard,
    title: "Buy Virtual Card",
    desc: "Get your Virtual Card today and enjoy the ease of using your USD card for online shopping, gaming, or favorite subscriptions.",
  },
  {
    number: "02",
    tag: "Wallet",
    tagColor: "text-indigo-500 bg-indigo-500/10",
    accentColor: "from-indigo-500 to-[#8055FF]",
    icon: Wallet,
    title: "Add Money",
    desc: "Easily deposit funds in Birr into your digital wallet to ensure financial flexibility and convenience with fast settlement.",
  },
  {
    number: "03",
    tag: "Transfer",
    tagColor: "text-purple-500 bg-purple-500/10",
    accentColor: "from-purple-500 to-pink-500",
    icon: ArrowRightLeft,
    title: "Money Transfer",
    desc: "Swiftly and securely transfer money within the platform, providing convenience and peace of mind for your team or family.",
  },
  {
    number: "04",
    tag: "Top Up",
    tagColor: "text-cyan-500 bg-cyan-500/10",
    accentColor: "from-cyan-500 to-blue-500",
    icon: RefreshCw,
    title: "Virtual Card TopUp",
    desc: "Easily top up your virtual card balance at any time to ensure uninterrupted spending for digital advertising, cloud tools, or flights.",
  },
  {
    number: "05",
    tag: "Security",
    tagColor: "text-emerald-500 bg-emerald-500/10",
    accentColor: "from-emerald-500 to-teal-500",
    icon: Fingerprint,
    title: "Biometric Login",
    desc: "Log in securely using modern biometric authentication and hardware keys for maximum identity protection.",
  },
  {
    number: "06",
    tag: "Logs",
    tagColor: "text-violet-500 bg-violet-500/10",
    accentColor: "from-violet-500 to-indigo-500",
    icon: Receipt,
    title: "Transaction Logs",
    desc: "Access detailed logs and instant receipts of all your transactions to monitor spending and keep finances reconciled.",
  },
  {
    number: "07",
    tag: "Global",
    tagColor: "text-amber-500 bg-amber-500/10",
    accentColor: "from-amber-500 to-orange-500",
    icon: Globe,
    title: "Multi-Currency Support",
    desc: "Fund your account locally in Ethiopian Birr and spend internationally in US Dollars with zero surprise FX charges.",
  },
];

/**
 * Services
 *
 * Numbered services grid inspired by https://yenecard.com/
 */
export default function Services() {
  return (
    <section id="services" className="relative w-full py-24 px-6 sm:px-8 lg:px-12 bg-[#F8F9FF] dark:bg-[#080C18] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-indigo-500/15 shadow-sm text-xs font-semibold text-[#8055FF] dark:text-[#A98FF5] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8055FF] dark:bg-[#A98FF5] animate-pulse" />
            Service Provide
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F172A] dark:text-white max-w-2xl leading-tight">
            Our Upheld Administrations{" "}
            <span className="bg-gradient-to-r from-blue-600 via-[#8055FF] to-purple-600 bg-clip-text text-transparent">
              What We Serve To You
            </span>
          </h2>

          <p className="mt-4 text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Unlock seamless digital transactions with our powerful services, from virtual card management and secure payments to multi-language support and real-time notifications.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="group relative bg-white/85 dark:bg-[#0F1428]/80 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl p-7 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#8055FF]/30 dark:hover:border-[#8055FF]/40 overflow-hidden"
              >
                {/* Accent Side Line */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${service.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon Container */}
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-[#8055FF] dark:text-[#A98FF5] group-hover:scale-110 transition-transform">
                  <Icon size={22} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${service.tagColor} mb-2`}>
                    {service.tag}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-white group-hover:text-[#8055FF] dark:group-hover:text-[#A98FF5] transition-colors mb-1.5">
                    {service.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                {/* Big Background Number */}
                <span className="absolute bottom-3 right-4 text-4xl font-extrabold text-black/5 dark:text-white/5 select-none pointer-events-none group-hover:text-[#8055FF]/10 transition-colors">
                  {service.number}
                </span>
              </div>
            );
          })}
        </div>

        {/* Ready to Get Started Banner */}
        <div className="mt-14 rounded-2xl p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-500/10 via-[#8055FF]/10 to-purple-500/10 border border-[#8055FF]/20">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
              Ready to get started?
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Join thousands of users who trust Arifcard for their digital finances.
            </p>
          </div>
          <Link
            to="/register"
            className="shrink-0 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-[#8055FF] to-purple-600 hover:opacity-95 shadow-[0_4px_20px_rgba(128,85,255,0.35)] transition-all"
          >
            Explore All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
