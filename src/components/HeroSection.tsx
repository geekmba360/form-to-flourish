import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle, Loader2 } from "lucide-react";

export const HeroSection = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  return (
    <section className="bg-gradient-subtle pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up">
          <Target className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Anticipate Interview Questions
          </h1>
        </div>
        
        <p className="text-lg text-primary font-medium mb-4 animate-fade-in-up [animation-delay:200ms]">
          A premium service from NailYourJobInterview.com
        </p>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 animate-fade-in-up [animation-delay:400ms]">
          Real Interview Questions from Your Target Company — Based on Our Proprietary Database
        </h2>
        
        <div className="bg-card p-8 rounded-2xl shadow-medium mb-8 animate-scale-in [animation-delay:600ms]">
          <p className="text-xl text-foreground font-bold mb-6">
            Don't risk walking in blind to your next interview—get the real questions they'll ask.
          </p>
          
          <p className="text-lg text-foreground mb-6">
            We'll send you a <strong>personalized list of interview questions</strong> drawn from our proprietary database — actual questions asked in past interviews for similar roles at your target company, based on feedback from candidates we've coached.
          </p>

          <p className="text-lg text-foreground mb-6">
            Every question is tailored to <strong>your specific role and company</strong>, built from a detailed analysis of each line of your job description, combined with insights from real interviews at that employer.
          </p>
          
          <p className="text-lg text-foreground font-medium">
            You'll walk in prepared with the exact questions they're likely to ask — not generic practice questions.
          </p>
        </div>
        
        <Button 
          size="xl" 
          variant="cta" 
          className="animate-fade-in-up [animation-delay:800ms]"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              const { supabase } = await import("@/integrations/supabase/client");
              const { data, error } = await supabase.functions.invoke('create-payment', {
                body: { packageId: 'anticipate' }
              });
              
              if (error) throw error;
              
              // Open Stripe checkout in current tab for faster conversion
              window.location.href = data.url;
            } catch (error) {
              console.error('Payment error:', error);
              setIsLoading(false);
              // Fallback to pricing section if payment fails
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isLoading ? "Processing..." : "Get My Custom Questions - $79"}
        </Button>
        
        <p className="text-sm text-muted-foreground mt-3 animate-fade-in-up [animation-delay:900ms]">
          Land your dream job for less than the cost of a resume review
        </p>
        
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground animate-fade-in-up [animation-delay:1000ms]">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Delivered within 24 hours</span>
        </div>
      </div>
    </section>
  );
};