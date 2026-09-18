import { Megaphone } from "lucide-react";
import MarketingLayout from "../../layouts/MarketingLayout";
import PageHero from "../../components/shared/PageHero";

/**
 * AnnouncementPage
 *
 * Route: /announcement — product news and updates. Genuinely empty for
 * now (nothing to announce yet), shown as an honest empty state rather
 * than placeholder posts.
 */
function AnnouncementPage() {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Announcements" heading="Product updates &amp; news" />
      <section className="bg-[#FAFAFA] dark:bg-[#070B15] px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center rounded-2xl border border-dashed border-[#D9DDE4] dark:border-[#303643] px-6 py-16">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#8055FF]/10 text-[#8055FF]">
            <Megaphone size={20} />
          </span>
          <h2 className="mt-4 text-[16px] font-semibold text-[#101217] dark:text-[#F6F7F9]">
            No announcements yet
          </h2>
          <p className="mt-2 text-[13.5px] text-[#687180] dark:text-[#A6AFBE]">
            Check back soon — we'll post product updates and news here as they happen.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default AnnouncementPage;
