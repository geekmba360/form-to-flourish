import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      
      <HeroSection />
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
