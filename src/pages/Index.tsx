import { HeroSection } from "@/components/HeroSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatYouGetSection />
      <AboutSection />
      <TestimonialsSection />
      <PricingSection />
      <HowItWorksSection />
    </div>
  );
};

export default Index;
