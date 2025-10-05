import { MessageSquare, Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "The list Andrew sent me nailed the questions I was asked. I walked in prepared and left with an offer from Amazon.",
      role: "Senior Product Manager",
      company: "Amazon"
    },
    {
      quote: "I didn't realize how much I was guessing until I saw the list he sent me. I used it to build stories around every question. I got the job.",
      role: "Sr. Director, Marketing", 
      company: "Series B Startup"
    },
    {
      quote: "He helped me navigate a VP-level interview at a company growing 300% a year. The prep was focused, high-quality, and totally worth it.",
      role: "VP of Operations",
      company: "Fintech"
    },
    {
      quote: "It's hard to know what questions really matter until someone shows you. This was laser-focused on my role and my company.",
      role: "Software Engineer",
      company: "Meta" 
    },
    {
      quote: "I've worked with other coaches, but Andrew's method is different. He doesn't recycle generic advice — he digs deep and personalizes everything.",
      role: "Chief of Staff",
      company: "AI startup"
    },
    {
      quote: "Andrew's preparation was instrumental in helping me land my current role. His insights into company culture and what leadership was really looking for made all the difference.",
      role: "SVP/GM",
      company: "Enterprise SaaS"
    }
  ];

  return (
    <section className="py-16 px-4 bg-testimonial-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">What Clients Say</h2>
        </div>

        <div className="bg-primary/10 border-2 border-primary p-8 rounded-2xl shadow-strong mb-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-1 mb-4 justify-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-accent text-accent" />
            ))}
          </div>
          <blockquote className="text-xl text-foreground font-semibold text-center mb-4">
            "The list Andrew sent me nailed the questions I was asked. I walked in prepared and left with an offer from Amazon."
          </blockquote>
          <div className="text-center">
            <p className="font-semibold text-foreground">Senior Product Manager</p>
            <p className="text-primary font-bold">Amazon</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card p-6 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              <blockquote className="text-foreground mb-4 italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="border-t pt-4">
                <p className="font-semibold text-foreground">{testimonial.role}</p>
                <p className="text-sm text-primary">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-success/10 border border-success/20 p-6 rounded-xl inline-block">
            <p className="text-foreground font-medium">
              Join <strong className="text-success">1,000+</strong> professionals who've landed their dream jobs with personalized interview prep
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};