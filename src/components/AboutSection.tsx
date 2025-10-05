import { User, GraduationCap, BookOpen, Award } from "lucide-react";

export const AboutSection = () => {
  const credentials = [
    "Computer Science degree from UC Berkeley",
    "MBA from Kellogg", 
    "20+ years of experience hiring and leading teams",
    "Coached thousands to land jobs at top companies"
  ];

  const books = [
    "The Secret of People Who Always Get Job Offers",
    "How to Get a Job at Amazon",
    "How to Get a Job at Google", 
    "Smart Move: How to Become a Product Manager"
  ];

  const companies = ["Amazon", "Google", "Meta", "Stripe", "Silicon Valley startups"];

  return (
    <section className="py-16 px-4 bg-hero-bg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <User className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Who Am I?</h2>
        </div>
        
        <div className="bg-card p-8 rounded-2xl shadow-medium">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Led by Andrew Franklin</h3>
            <p className="text-lg text-muted-foreground">
              Former software engineer, product manager, CMO, and GM
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-foreground mb-6">
                Andrew has over 20 years of experience hiring and leading teams at high-growth startups and publicly traded tech companies.
              </p>
              
              <p className="text-foreground mb-6">
                He's personally hired hundreds of people — and since 2008, our team has coached thousands more to land jobs at {companies.slice(0, -1).join(", ")}, and other top employers.
              </p>
              
              <p className="text-foreground">
                Over the years, we've built a proprietary database of actual interview questions from these companies, gathered from candidate feedback after their interviews. We take a strategic, structured, and pragmatic approach to interview prep — grounded in real hiring experience and real interview data.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Education & Experience</h4>
                </div>
                <ul className="space-y-2">
                  {credentials.map((credential, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Best-selling Author</h4>
                </div>
                <ul className="space-y-2">
                  {books.map((book, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-accent">•</span>
                      <em>{book}</em>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl text-center">
            <p className="text-foreground">
              We run <strong className="text-primary">
                <a 
                  href="https://nailyourjobinterview.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-hover transition-colors"
                >
                  NailYourJobInterview.com
                </a>
              </strong>, where we help professionals at all levels navigate job transitions with strategy and confidence.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              <a 
                href="https://nailyourjobinterview.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                Read our latest interview tips and career advice →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};