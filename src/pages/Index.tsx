import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { WhatYouGetSection } from "@/components/WhatYouGetSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { PricingSection } from "@/components/PricingSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Temporary debug link */}
      <div className="fixed top-4 right-4 z-50">
        <Button asChild variant="outline">
          <Link to="/auth">Admin Login</Link>
        </Button>
      </div>
      
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
