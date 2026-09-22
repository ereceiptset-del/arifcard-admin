import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Shield } from "lucide-react";

const FAQ_ITEMS = [
  // Left Column (3 items)
  {
    id: "buy-card",
    question: "How can I buy a virtual card?",
    answer:
      "Sign up or log in to your Arifcard account, navigate to the Virtual Cards section, choose your preferred funding option in Ethiopian Birr, and your new USD card is issued instantly with live card number, expiry, and CVV.",
    column: "left",
  },
  {
    id: "topup-card",
    question: "How can I top up my virtual card?",
    answer:
      "Select your active virtual card from your dashboard, click 'Top Up', enter the desired USD amount, and confirm the deduction from your local wallet balance.",
    column: "left",
  },
  {
    id: "add-money",
    question: "How do I add money to my wallet?",
    answer:
      "Go to 'Add Money', choose your preferred Ethiopian payment method (Telebirr, CBE, or mobile banking), specify the amount, and your wallet balance will be credited instantly.",
    column: "left",
  },

  // Right Column (2 items)
  {
    id: "transfer-money",
    question: "How can I transfer money?",
    answer:
      "Head over to the 'Money Transfer' section, input the recipient's Arifcard handle or email along with the amount, and confirm with your secure authentication code.",
    column: "right",
  },
  {
    id: "transaction-logs",
    question: "Where can I view my transaction logs?",
    answer:
      "Click on 'Transaction Logs' in your main dashboard or card view to see an itemized, real-time breakdown of all debits, refunds, top-ups, and merchant authorizations.",
    column: "right",
  },
];

/**
 * AboutFAQ (Frequently Asked Questions)
 *
 * Exact match to media_1789719674811.png and yenecard.com:
 * - Eyebrow badge: ● Faq Section
 * - Centered title: "Advanced Security Features Designed to Protect Your Information Effectively"
 * - Subtitle narrative
 * - 2-column layout with 5 accordion questions with purple toggle button
 * - Centered "Still have questions? Contact our 24/7 support team" banner with "Get Help" button
 */
export default function AboutFAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const leftItems = FAQ_ITEMS.filter((item) => item.column === "left");
  const rightItems = FAQ_ITEMS.filter((item) => item.column === "right");

  return (
    <section
      id="faq-section"
      className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#080C16] dark:via-[#0D1220] dark:to-[#111827] transition-colors duration-300"
    >
      {/* Background ambient lighting orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-20 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-400/10 via-indigo-400/5 to-transparent dark:from-blue-500/8 dark:via-indigo-500/4 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/10 via-violet-400/5 to-transparent dark:from-purple-500/8 dark:via-violet-500/4 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header Section */}
        <div className="text-center mb-14 sm:mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/15 dark:border-indigo-400/20 shadow-[0_2px_16px_rgba(99,102,241,0.1)] text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            Faq Section
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            Advanced Security Features Designed to{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Protect Your Information
            </span>{" "}
            Effectively
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Our security system employs advanced technology to ensure the utmost protection for your sensitive information. With state-of-the-art encryption, multi-layered authentication, and real-time monitoring, your data is safeguarded against unauthorized access and breaches. Experience peace of mind knowing that our robust security measures are designed to keep your information secure and private at all times.
          </p>
        </div>

        {/* 2-Column Accordion Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 max-w-5xl mx-auto items-start">
          {/* Left Column (3 items) */}
          <div className="space-y-4">
            {leftItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white">
                      {item.question}
                    </h3>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 transition-transform duration-300">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <p className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column (2 items) */}
          <div className="space-y-4">
            {rightItems.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="rounded-2xl bg-white/95 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white">
                      {item.question}
                    </h3>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 transition-transform duration-300">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {isOpen && (
                    <p className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Support Callout Banner */}
        <div className="mt-12 sm:mt-16 max-w-xl mx-auto">
          <div className="rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                <Shield className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Still have questions?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Contact our 24/7 support team for assistance
                </p>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-500/30 transition-all shrink-0 cursor-pointer"
            >
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
