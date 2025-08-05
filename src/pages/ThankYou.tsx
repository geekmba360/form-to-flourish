import { CheckCircle, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center shadow-medium">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <CardTitle className="text-3xl text-foreground mb-4">
            Thank You for Your Submission!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-center gap-3 text-lg font-medium text-foreground">
              <Clock className="w-6 h-6 text-primary" />
              What Happens Next?
            </div>
            <p className="text-muted-foreground leading-relaxed">
              I'll carefully review your information and create a personalized list of anticipated interview questions tailored specifically to your background and the role you're pursuing.
            </p>
            <div className="flex items-center justify-center gap-3 text-accent font-medium">
              <Mail className="w-5 h-5" />
              You'll receive your questions within 24 hours
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              Questions or Need Help?
            </h3>
            <p className="text-muted-foreground">
              If you have any questions or need assistance, don't hesitate to reach out to me directly:
            </p>
            <div className="bg-card border rounded-lg p-4">
              <a 
                href="mailto:andrew@nailyourjobinterview.com"
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                andrew@nailyourjobinterview.com
              </a>
            </div>
          </div>

          <div className="pt-6">
            <Button asChild variant="outline" size="lg">
              <Link to="/">
                Return to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;