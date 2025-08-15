import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ORDER-CONFIRMATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { orderId } = await req.json();
    logStep("Received order ID", { orderId });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }
    logStep("Order retrieved", { packageName: order.package_name, email: order.customer_email });

    // Update order status to completed
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    if (updateError) {
      logStep("Failed to update order status", { error: updateError });
    }

    // Extract customer name from email (fallback)
    const emailParts = order.customer_email.split('@');
    const defaultName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);

    logStep("Sending order confirmation email to customer", { email: order.customer_email });

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Thank you for your purchase!</h2>
        
        <p>Hi ${defaultName},</p>
        
        <p>Thank you for purchasing the <strong>${order.package_name}</strong> package. We're excited to help you nail your job interview!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Order Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Package:</strong> ${order.package_name}</li>
            <li><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)}</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
          </ul>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Complete your intake form:</strong> Please fill out your intake form so we can customize your experience.</li>
            <li><strong>Anticipated Interview Questions Report:</strong> You'll receive your customized report within 24 hours of submitting the intake form.</li>
            ${order.package_name.includes('Coaching') || order.package_name.includes('coaching') ? 
              '<li><strong>Coaching Session:</strong> We\'ll be in touch to schedule your first coaching session.</li>' : ''}
          </ul>
        </div>
        
        <p><a href="https://vbgyzisstcvrikdhpiil.supabase.co/intake-form?order_id=${orderId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
           Complete Your Intake Form</a></p>
        
        <p>If you have any questions or need assistance, please don't hesitate to email me at 
        <a href="mailto:andrew@nailyourjobinterview.com" style="color: #2563eb;">andrew@nailyourjobinterview.com</a>.</p>
        
        <p>Best regards,<br>
        Andrew<br>
        <strong>Nail Your Job Interview</strong></p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Andrew from Nail Your Job Interview <noreply@updates.nailyourjobinterview.com>",
        to: [order.customer_email],
        replyTo: "andrew@nailyourjobinterview.com",
        subject: "Thank you for your purchase - Next steps inside!",
        html: customerEmailHtml,
      });
      logStep("Customer confirmation email sent successfully");
    } catch (error) {
      logStep("Customer email failed", { error: error.message });
    }

    // Send notification email to Andrew
    logStep("Sending notification email to Andrew");

    const andrewEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">New Purchase Notification</h2>
        
        <p>A customer has made a purchase!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Customer Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Name:</strong> ${defaultName}</li>
            <li><strong>Email:</strong> ${order.customer_email}</li>
            <li><strong>Package:</strong> ${order.package_name}</li>
            <li><strong>Amount:</strong> $${(order.amount / 100).toFixed(2)}</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
          </ul>
        </div>
        
        <p><a href="https://vbgyzisstcvrikdhpiil.supabase.co/admin" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
           View in Admin Panel</a></p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reminder:</strong> Customer will need to complete intake form before receiving the report.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Nail Your Job Interview <noreply@updates.nailyourjobinterview.com>",
        to: ["andrew@nailyourjobinterview.com"],
        replyTo: "andrew@nailyourjobinterview.com",
        subject: `New Purchase: ${defaultName} - ${order.package_name}`,
        html: andrewEmailHtml,
      });
      logStep("Andrew notification email sent successfully");
    } catch (error) {
      logStep("Andrew notification email failed", { error: error.message });
    }

    logStep("Order confirmation process completed");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});