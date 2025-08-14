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
      {/* DEBUG: Test links using React Router */}
      <div className="w-full bg-yellow-400 text-black p-4 text-center space-x-4">
        <Button asChild variant="default">
          <Link to="/test">Test Route</Link>
        </Button>
        <Button asChild variant="default">
          <Link to="/auth">Auth Route</Link>
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
