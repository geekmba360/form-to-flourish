import { useState } from "react";
import { ArrowRight, CreditCard, FileText, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HowItWorksSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { packageId: 'anticipate' }
      });
      
      if (error) throw error;
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      setIsLoading(false);
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const steps = [
    {
      icon: CreditCard,
      title: "Click \"Get My Questions\" and complete your purchase",
      description: "Secure checkout process with instant confirmation"
    },
    {
      icon: FileText, 
      title: "Upload your job description and LinkedIn profile",
      description: "You'll be directed to a short form to provide your details"
    },
    {
      icon: Send,
      title: "Receive your custom interview questions within 24 hours",
      description: "I'll take it from there and deliver personalized questions to your inbox"
    }
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Get your personalized interview questions in 3 simple steps
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-6">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="bg-card p-6 rounded-xl shadow-soft">
                  <div className="flex items-start gap-4">
                    <step.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-6">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-hero-bg p-8 rounded-xl inline-block">
            <p className="text-foreground font-medium mb-6">
              <strong>Ready to prep smarter?</strong> Stop guessing. Start preparing with clarity.
            </p>
            <Button 
              size="lg" 
              variant="cta"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Processing..." : "Get My Personalized Questions - $79"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};