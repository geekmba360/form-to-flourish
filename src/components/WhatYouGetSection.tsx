import { CheckCircle, Clock, Target, FileText, Users, Lightbulb } from "lucide-react";

export const WhatYouGetSection = () => {
  const benefits = [
    {
      icon: Target,
      title: "Your target company",
      description: "Questions tailored to the specific company culture and values"
    },
    {
      icon: FileText,
      title: "Your job description", 
      description: "Role-specific questions that match the exact requirements"
    },
    {
      icon: Users,
      title: "Your LinkedIn profile or resume",
      description: "Questions that leverage your unique background and experience"
    }
  ];

  const questionTypes = [
    "Behavioral & leadership questions",
    "Technical or functional questions", 
    "Role- and domain-specific questions",
    "Bonus: a list of questions for you to ask the interviewer"
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <CheckCircle className="w-8 h-8 text-success" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">What You Get</h2>
        </div>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-hero-bg px-6 py-3 rounded-full shadow-soft">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Within 24 hours of purchase</span>
          </div>
        </div>

        <p className="text-lg text-center text-foreground mb-12 max-w-3xl mx-auto">
          You'll receive a customized list of likely interview questions, curated specifically for:
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-card p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-testimonial-bg p-8 rounded-2xl shadow-medium">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Questions are categorized into:</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {questionTypes.map((type, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{type}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <p className="text-foreground">
                <strong>This is not a one-size-fits-all list.</strong> It's designed just for you — built from deep research and refined through years of coaching insight.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};