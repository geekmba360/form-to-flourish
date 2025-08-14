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
      {/* DEBUG: Test auth route - should be very visible */}
      <div className="w-full bg-red-500 text-white p-4 text-center">
        <Button asChild variant="secondary" size="lg">
          <Link to="/auth">🔑 ADMIN LOGIN TEST BUTTON 🔑</Link>
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
