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
  console.log(`[INTAKE-NOTIFICATIONS] ${step}${detailsStr}`);
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

    const { orderId, formData } = await req.json();
    logStep("Received data", { orderId, customerName: formData.name || `${formData.firstName} ${formData.lastName}` });

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    // Get customer information
    const customerName = formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    const customerEmail = formData.email || order.customer_email;
    const firstName = formData.firstName || formData.name?.split(' ')[0] || customerName.split(' ')[0] || 'Customer';

    logStep("Sending intake confirmation email to customer", { email: customerEmail });

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Thank you for submitting your intake form!</h2>
        
        <p>Hi ${firstName},</p>
        
        <p>We've received your intake form for the <strong>${order.package_name}</strong> package. Thank you for providing all the details!</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Anticipated Interview Questions Report:</strong> You'll receive your customized report within 24 hours.</li>
            ${order.package_name.includes('Coaching') || order.package_name.includes('coaching') ? 
              '<li><strong>Coaching Session:</strong> We\'ll be in touch to schedule your first coaching session.</li>' : ''}
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to email me at
        <a href="mailto:andrew@nailyourjobinterview.com" style="color: #2563eb;">andrew@nailyourjobinterview.com</a>.</p>
        
        <p>Best regards,<br>
        Andrew<br>
        <strong>Nail Your Job Interview</strong></p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Andrew from Nail Your Job Interview <andrew@updates.nailyourjobinterview.com>",
        to: [customerEmail],
        replyTo: "andrew@nailyourjobinterview.com",
        subject: "Intake Form Received - Your Report is Coming Soon!",
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
        <h2 style="color: #dc2626;">New Intake Form Submission</h2>
        
        <p>A customer has submitted their intake form.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">Customer Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Name:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
            <li><strong>Package:</strong> ${order.package_name}</li>
            <li><strong>Order ID:</strong> ${orderId}</li>
            ${formData.phone ? `<li><strong>Phone:</strong> ${formData.phone}</li>` : ''}
            ${formData.linkedin ? `<li><strong>LinkedIn:</strong> ${formData.linkedin}</li>` : ''}
          </ul>
        </div>
        
        <p><a href="https://form-to-flourish.lovable.app/auth" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
           View Submission Details in Admin Panel</a></p>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reminder:</strong> Follow up within 24 hours with the anticipated interview questions report.</p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: "Nail Your Job Interview <andrew@updates.nailyourjobinterview.com>",
        to: ["andrew@nailyourjobinterview.com"],
        replyTo: "andrew@nailyourjobinterview.com",
        subject: `New Intake Form: ${customerName} (${order.package_name})`,
        html: andrewEmailHtml,
      });
      logStep("Andrew notification email sent successfully");
    } catch (error) {
      logStep("Andrew notification email failed", { error: error.message });
    }

    logStep("Intake notification process completed");

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