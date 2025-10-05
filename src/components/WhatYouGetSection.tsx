import { CheckCircle, Clock, Target, FileText, Users, Lightbulb } from "lucide-react";

export const WhatYouGetSection = () => {
  const benefits = [
    {
      icon: Target,
      title: "Company-specific questions",
      description: "Real questions from past interviews at your target company for similar roles, pulled from our proprietary database"
    },
    {
      icon: FileText,
      title: "Line-by-line job analysis", 
      description: "Detailed analysis of each requirement in your job description to predict relevant questions"
    },
    {
      icon: Users,
      title: "Your background matters",
      description: "Questions tailored to your LinkedIn profile or resume to leverage your unique experience"
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
                <strong>Powered by real interview data.</strong> Our proprietary database contains actual questions from past interviews, gathered through years of coaching candidates at your target companies. This isn't guesswork — it's based on feedback from real interviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};