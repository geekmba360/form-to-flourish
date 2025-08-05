import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderId = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get order ID from the database using session ID
        const { data, error } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching order:', error);
        } else if (data) {
          setOrderId(data.id);
          
          // Send order confirmation email
          try {
            await supabase.functions.invoke('send-order-confirmation', {
              body: { orderId: data.id }
            });
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the whole process if email fails
          }
        } else {
          console.log('No order found for session ID:', sessionId);
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderId();
  }, [sessionId]);

  const handleContinueToForm = () => {
    if (orderId) {
      navigate(`/intake-form?order_id=${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Thank you for your purchase! To get started on your personalized interview questions, 
            please complete the intake form with your details.
          </p>
          
          {sessionId && (
            <div className="text-sm text-muted-foreground bg-secondary p-3 rounded border">
              <strong>Order Reference:</strong> {sessionId.slice(-8)}
            </div>
          )}
          
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Mail className="w-5 h-5" />
              <span>Check your email for order confirmation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive an email with your order details and a backup link to this form.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Next Step:</h3>
            <p className="text-muted-foreground">
              Complete the intake form below to provide your job details and background information.
            </p>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleContinueToForm}
              className="w-full"
              size="lg"
              disabled={isLoading || !orderId}
            >
              {isLoading ? "Loading..." : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Complete Intake Form
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              You can also complete this form later using the link in your email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;