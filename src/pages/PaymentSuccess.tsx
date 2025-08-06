import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { IntakeForm } from "@/components/IntakeForm";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('PaymentSuccess component rendered');
  console.log('Session ID from URL:', sessionId);

  useEffect(() => {
    const fetchOrderId = async () => {
      if (!sessionId) {
        console.log('No session ID found');
        setError('No session ID found in URL');
        setIsLoading(false);
        return;
      }

      const cleanSessionId = sessionId.trim();
      console.log('Fetching order for session ID:', cleanSessionId);

      try {
        // Query orders table to find the order by session ID
        const { data, error } = await supabase
          .from('orders')
          .select('id, customer_email, package_name, amount, status')
          .eq('stripe_session_id', cleanSessionId)
          .maybeSingle();

        console.log('Database query result:', { data, error });

        if (error) {
          console.error('Error fetching order:', error);
          setError(`Database error: ${error.message}`);
          setIsLoading(false);
          return;
        }

        if (data) {
          console.log('Order found:', data.id);
          setOrderId(data.id);
          
          // Send order confirmation email
          try {
            console.log('Sending order confirmation email...');
            const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
              body: { orderId: data.id }
            });
            
            if (emailError) {
              console.error('Error sending confirmation email:', emailError);
            } else {
              console.log('Order confirmation email sent successfully');
            }
          } catch (emailError) {
            console.error('Error invoking email function:', emailError);
          }
        } else {
          console.log('No order found for session ID:', cleanSessionId);
          
          // Debug: Check recent orders
          const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, stripe_session_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
          
          console.log('Recent orders for debugging:', recentOrders);
          setError('Order not found. Please contact support if this issue persists.');
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
        setError('An unexpected error occurred. Please contact support.');
      }
      
      setIsLoading(false);
    };

    fetchOrderId();
  }, [sessionId]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-destructive mb-4">Payment Processing Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Session ID: {sessionId?.slice(-8) || 'Not found'}
            </p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success state with intake form
  return (
    <div className="min-h-screen bg-hero-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <Card className="mb-8 shadow-medium">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl text-center text-foreground">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase! Please complete the intake form below to get your personalized interview questions.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Questions delivered within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>Confirmation email sent</span>
              </div>
            </div>

            {sessionId && (
              <div className="text-xs text-muted-foreground bg-secondary p-2 rounded">
                Order Reference: {sessionId.slice(-8)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intake Form */}
        {orderId ? (
          <IntakeForm orderId={orderId} />
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Unable to load intake form. Please contact support with your order reference.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;