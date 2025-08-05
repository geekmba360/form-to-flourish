import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Shield, Target, Users, FileText } from "lucide-react";

export const PricingSection = () => {
  const packages = [
    {
      id: "anticipate",
      name: "Anticipate Interview Questions",
      price: 79,
      originalPrice: 99,
      description: "Personalized list of interview questions tailored to your job, company, and background — delivered in 24 hours.",
      features: [
        "Custom interview questions within 24 hours",
        "Questions specific to your target company",
        "Tailored to your job description",
        "Based on your LinkedIn/resume",
        "Behavioral & leadership questions",
        "Technical/functional questions", 
        "Role-specific questions",
        "Bonus: Questions to ask the interviewer"
      ],
      popular: true,
      cta: "Get My Questions"
    },
    {
      id: "express",
      name: "Express Interview Prep Package Plus",
      price: 849,
      description: "Two private coaching sessions + unlimited email support + Anticipate Interview Questions",
      features: [
        "Everything in Anticipate Questions",
        "2 private 1-on-1 coaching sessions",
        "Unlimited email support",
        "Interview strategy development",
        "Mock interview practice",
        "Real-time feedback and improvements"
      ],
      popular: false,
      cta: "Book Express Package"
    },
    {
      id: "allin",
      name: "All-In Interview Prep Package Plus", 
      price: 1679,
      description: "Four private coaching sessions, full resume/cover review, unlimited email support + Anticipate Interview Questions",
      features: [
        "Everything in Express Package",
        "4 private 1-on-1 coaching sessions",
        "Complete resume review & optimization",
        "Cover letter review & writing",
        "LinkedIn profile optimization",
        "Salary negotiation coaching",
        "30-day follow-up support"
      ],
      popular: false,
      cta: "Get Complete Package"
    }
  ];

  return (
    <section id="pricing" className="py-16 px-4 bg-pricing-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-accent font-semibold">
            🎁 Limited-Time Launch Offer
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Interview Success Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop guessing. Start preparing with clarity and confidence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg, index) => (
            <div key={pkg.id} className={`bg-card rounded-2xl shadow-medium hover:shadow-strong transition-all duration-300 ${pkg.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
              {pkg.popular && (
                <div className="bg-gradient-primary text-white text-center py-2 rounded-t-2xl font-semibold">
                  ⭐ Most Popular
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{pkg.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-foreground">${pkg.price}</span>
                    {pkg.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={pkg.popular ? "cta" : "default"} 
                  size="lg" 
                  className="w-full"
                >
                  {pkg.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-medium text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-success" />
            <h3 className="text-xl font-semibold text-foreground">Risk-Free Guarantee</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            If you don't find the list helpful, reply within 7 days and I'll refund you — no questions asked. 
            All I ask is that you don't use the content if you request a refund.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">24-Hour Delivery</p>
                <p className="text-sm text-muted-foreground">Questions delivered fast</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">100% Personalized</p>
                <p className="text-sm text-muted-foreground">No generic content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">Proven Results</p>
                <p className="text-sm text-muted-foreground">1,000+ success stories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};