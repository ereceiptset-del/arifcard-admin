import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What is Addiscard?",
    a: "Addiscard is a fintech platform that allows you to instantly generate virtual USD cards funded in Ethiopian Birr. You can pay for international subscriptions, online ads, flight bookings, and software tools without having an overseas bank account.",
  },
  {
    q: "How do I fund my wallet in Ethiopia?",
    a: "You can deposit Ethiopian Birr directly into your Addiscard wallet through local mobile money services like Telebirr, CBE Birr, or direct bank transfer. The deposit is converted into USD instantly at clear, transparent exchange rates.",
  },
  {
    q: "Where can I use my Addiscard Virtual Card?",
    a: "Your Addiscard Virtual USD card works on any merchant platform accepting global cards, including AliExpress, Amazon, Netflix, Spotify, Facebook Ads, Google Workspace, OpenAI/ChatGPT, GitHub, and airline booking portals.",
  },
  {
    q: "Are there any hidden monthly maintenance fees?",
    a: "No. Addiscard has zero hidden monthly or maintenance fees. You only pay for what you spend and the transparent top-up conversion shown upfront before you confirm any deposit.",
  },
  {
    q: "Can I freeze or delete my card at any time?",
    a: "Yes. From your account dashboard, you can freeze, unfreeze, set custom spending caps, or delete your virtual card instantly with one tap.",
  },
  {
    q: "How do I contact support if I have a question?",
    a: "Our support team is available 24/7 via in-app live chat and email at support@addiscard.com.",
  },
];

/**
 * FAQ
 *
 * Smooth interactive accordion for frequently asked questions
 */
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="relative w-full py-24 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#070A12] transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8055FF]/10 text-xs font-semibold text-[#8055FF] dark:text-[#A98FF5] mb-4">
            <HelpCircle size={14} />
            Common Questions
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-base text-gray-600 dark:text-gray-400 max-w-xl">
            Everything you need to know about setting up your card, funding your balance, and spending globally.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden transition-all bg-[#F8F9FF] dark:bg-[#0E1322]"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                >
                  <span className="text-base font-semibold text-[#0F172A] dark:text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#8055FF] dark:text-[#A98FF5] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400 border-t border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
