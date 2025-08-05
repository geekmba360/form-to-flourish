import { Button } from "@/components/ui/button";
import { Target, CheckCircle } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="bg-gradient-subtle py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Anticipate Interview Questions
          </h1>
        </div>
        
        <p className="text-lg text-primary font-medium mb-4 animate-fade-in-up [animation-delay:200ms]">
          A premium service from NailYourJobInterview.com
        </p>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 animate-fade-in-up [animation-delay:400ms]">
          Personalized Interview Prep Tailored to Your Job, Company, and Background
        </h2>
        
        <div className="bg-card p-8 rounded-2xl shadow-medium mb-8 animate-scale-in [animation-delay:600ms]">
          <p className="text-lg text-muted-foreground mb-6">
            If you're prepping for an important interview and don't want to walk in blind, this service is for you.
          </p>
          
          <p className="text-lg text-foreground mb-6">
            Instead of guessing what they'll ask, I'll <strong>send</strong> you a personalized list of interview questions based on your job description, target company, and background — delivered within 24 hours.
          </p>
          
          <p className="text-lg text-foreground font-medium">
            You'll save hours of stress and prep smarter with clarity and confidence.
          </p>
        </div>
        
        <Button 
          size="xl" 
          variant="cta" 
          className="animate-fade-in-up [animation-delay:800ms]"
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Get My Custom Questions - $79
        </Button>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground animate-fade-in-up [animation-delay:1000ms]">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>Delivered within 24 hours</span>
        </div>
      </div>
    </section>
  );
};