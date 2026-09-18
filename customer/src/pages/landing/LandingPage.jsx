import MarketingLayout from "../../layouts/MarketingLayout";
import Hero from "../../components/landing/Hero";
import Services from "../../components/landing/Services";
import WhyChooseUs from "../../components/landing/WhyChooseUs";
import HowItWorks from "../../components/landing/HowItWorks";
import ProjectOverview from "../../components/landing/ProjectOverview";
import CTA from "../../components/landing/CTA";

/**
 * LandingPage
 *
 * Route: / — Addiscard main marketing page built on MarketingLayout
 * with floating pill navbar, hero section, services, why choose us,
 * how it works, project overview, CTA banner, and footer.
 */
function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <Services />
      <WhyChooseUs />
      <HowItWorks />
      <ProjectOverview />
      <CTA />
    </MarketingLayout>
  );
}

export default LandingPage;
