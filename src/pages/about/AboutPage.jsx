import MarketingLayout from "../../layouts/MarketingLayout";
import AboutHero from "../../components/about/AboutHero";
import Testimonials from "../../components/about/Testimonials";
import AboutFAQ from "../../components/about/AboutFAQ";

/**
 * AboutPage
 *
 * Route: /about — Matches yenecard.com & user screenshots:
 * 1. About Us (Empowering the Future of Online Transactions + 4 feature pills + 16 global brands grid)
 * 2. What Our Users Are Saying (3 Testimonial cards + 10,000+ rating pill)
 * 3. Frequently Asked Questions (Security features + 5 accordion questions + support help banner)
 */
function AboutPage() {
  return (
    <MarketingLayout>
      <AboutHero />
      <Testimonials />
      <AboutFAQ />
    </MarketingLayout>
  );
}

export default AboutPage;
