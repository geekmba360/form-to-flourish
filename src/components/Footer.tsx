import { Mail, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Anticipate Interview Questions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Personalized interview prep service by Andrew Franklin, helping professionals land their dream jobs with confidence.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <a 
                href="mailto:andrew@nailyourjobinterview.com"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                andrew@nailyourjobinterview.com
              </a>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              More Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://nailyourjobinterview.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Interview Tips & Career Advice
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://nailyourjobinterview.com/guides" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Career Guides
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://nailyourjobinterview.com/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  Coaching Services
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="/privacy" 
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/refund" 
                  className="hover:text-primary transition-colors"
                >
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 NailYourJobInterview.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};