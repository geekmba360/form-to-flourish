import { useSearchParams } from "react-router-dom";
import { IntakeForm as IntakeFormComponent } from "@/components/IntakeForm";
import { Card, CardContent } from "@/components/ui/card";

const IntakeForm = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const submissionToken = searchParams.get('token');

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Link</h1>
            <p className="text-muted-foreground">
              Invalid or missing order ID. Please check your email for the correct link or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-bg py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <IntakeFormComponent orderId={orderId} submissionToken={submissionToken || undefined} />
      </div>
    </div>
  );
};

export default IntakeForm;