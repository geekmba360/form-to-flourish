import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';
import { IntakeForm } from "@/components/IntakeForm";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Debug logs - these should appear in console
  console.log('PaymentSuccess component rendered');
  console.log('Current URL search params:', searchParams.toString());
  console.log('Session ID from URL:', sessionId);
  console.log('Current orderId state:', orderId);
  console.log('Current isLoading state:', isLoading);

  // Test if component is actually loading
  if (!sessionId) {
    console.log('No session ID - showing error message');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-red-600">No Session ID Found</h1>
            <p>Please check the URL has a session_id parameter</p>
            <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrderId = async () => {
      if (!sessionId) {
        console.log('No session ID found');
        setIsLoading(false);
        return;
      }

      // Trim and clean the session ID
      const cleanSessionId = sessionId.trim();
      console.log('Raw session ID from URL:', JSON.stringify(sessionId));
      console.log('Cleaned session ID:', JSON.stringify(cleanSessionId));
      console.log('Session ID length:', cleanSessionId.length);
      console.log('Session ID char codes:', cleanSessionId.split('').map(c => c.charCodeAt(0)));

      try {
        // Get order ID from the database using session ID (using service role for guest orders)
        console.log('Querying database for session ID:', cleanSessionId);
        
        // Create a service role client to bypass RLS for guest orders
        const supabaseServiceRole = createClient(
          'https://vbgyzisstcvrikdhpiil.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZ3l6aXNzdGN2cmlrZGhwaWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQwMTkzNiwiZXhwIjoyMDY5OTc3OTM2fQ.XApJYEgbKGXMKDr8Xr3Veo_gd4QSpZBLg7z_ZwLJKtc'
        );
        
        const { data, error } = await supabaseServiceRole
          .from('orders')
          .select('id, stripe_session_id')
          .eq('stripe_session_id', cleanSessionId)
          .maybeSingle();

        console.log('Database query result:', { data, error });

        // If no exact match, try to find any orders with similar session IDs for debugging
        if (!data && !error) {
          console.log('No exact match found, checking for any recent orders...');
          const { data: recentOrders, error: recentError } = await supabase
            .from('orders')
            .select('id, stripe_session_id, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
          
          console.log('Recent orders for debugging:', recentOrders);
          if (recentOrders) {
            recentOrders.forEach((order, index) => {
              console.log(`Order ${index + 1}:`, {
                id: order.id,
                sessionId: JSON.stringify(order.stripe_session_id),
                sessionIdLength: order.stripe_session_id?.length,
                matches: order.stripe_session_id === cleanSessionId,
                created: order.created_at
              });
            });
          }
        }

        if (error) {
          console.error('Error fetching order:', error);
          setIsLoading(false);
          return;
        } 
        
        if (data) {
          console.log('Order found, setting order ID:', data.id);
          setOrderId(data.id);
          
          // Send order confirmation email
          try {
            await supabase.functions.invoke('send-order-confirmation', {
              body: { orderId: data.id }
            });
            console.log('Order confirmation email sent successfully');
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the whole process if email fails
          }
        } else {
          console.log('No order found for session ID:', cleanSessionId);
          console.log('This could be due to:');
          console.log('1. Session ID mismatch or encoding issues');
          console.log('2. Order not yet created in database');
          console.log('3. Different session ID format than expected');
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
      }
      
      // Always set loading to false at the end
      setIsLoading(false);
    };

    fetchOrderId();
  }, [sessionId]);

  const handleContinueToForm = () => {
    if (orderId) {
      setShowForm(true);
    }
  };

  // If showing the form, render it instead
  if (showForm && orderId) {
    return <IntakeForm orderId={orderId} onBack={() => setShowForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl text-center text-foreground">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed text-center">
              Thank you for your purchase! Please complete the intake form below to get started on your personalized interview questions.
            </p>
            
            {sessionId && (
              <div className="text-sm text-muted-foreground bg-secondary p-3 rounded border text-center">
                <strong>Order Reference:</strong> {sessionId.slice(-8)}
              </div>
            )}
            
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium justify-center">
                <Mail className="w-5 h-5" />
                <span>Check your email for order confirmation</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                You'll receive an email with your order details and additional information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Always show the intake form if we have an orderId */}
        {orderId ? (
          <IntakeForm orderId={orderId} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {isLoading ? "Loading your order information..." : "Unable to load order information. Please contact support."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;