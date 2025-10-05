import { HeroSection } from "@/components/HeroSection";
import { CompanyLogosSection } from "@/components/CompanyLogosSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CompanyLogosSection />
      <WhatYouGetSection />
      <AboutSection />
      <TestimonialsSection />
      <PricingSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
};

export default Index;
