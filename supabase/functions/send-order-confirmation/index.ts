import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Send order confirmation email using Mailchimp
    const mailchimpApiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID") || "d7102b6132";
    
    if (!mailchimpApiKey) {
      logStep("WARNING: No Mailchimp API key found, skipping email");
      logStep("SETUP REQUIRED: Please set MAILCHIMP_API_KEY environment variable in Supabase Dashboard > Settings > Environment Variables");
      return new Response(JSON.stringify({ 
        success: true, 
        warning: "Email not sent - Mailchimp API key not configured",
        setup_required: "Please configure MAILCHIMP_API_KEY environment variable"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const serverPrefix = mailchimpApiKey.split('-')[1];
    
    // Extract customer name from email (fallback)
    const emailParts = order.customer_email.split('@');
    const defaultName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);

    // Add customer to Mailchimp audience
    const memberData = {
      email_address: order.customer_email,
      status: "subscribed",
      merge_fields: {
        FNAME: defaultName,
        ORDER_ID: orderId,
        PACKAGE: order.package_name,
        AMOUNT: (order.amount / 100).toFixed(2),
        INTAKE_LINK: `${req.headers.get("origin") || "https://your-domain.com"}/intake-form?order_id=${orderId}`
      },
      tags: ["order_confirmation", "anticipate_questions"]
    };

    logStep("Adding customer to Mailchimp", { email: order.customer_email });

    const mailchimpResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
      method: "PUT",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    const mailchimpResult = await mailchimpResponse.text();
    
    if (!mailchimpResponse.ok) {
      logStep("Mailchimp API error", { 
        status: mailchimpResponse.status, 
        error: mailchimpResult,
        memberData: memberData 
      });
    } else {
      logStep("Customer added to Mailchimp successfully");
    }

    // Send notification to Andrew
    const andrewNotificationData = {
      email_address: "andrew@nailyourjobinterview.com",
      status: "subscribed",
      merge_fields: {
        FNAME: "Andrew",
        ORDER_ID: orderId,
        CUSTOMER_EMAIL: order.customer_email,
        PACKAGE: order.package_name,
        AMOUNT: (order.amount / 100).toFixed(2),
        CUSTOMER_NAME: defaultName
      },
      tags: ["new_order_notification"]
    };

    const notificationResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
      method: "PUT",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(andrewNotificationData),
    });

    if (!notificationResponse.ok) {
      const notificationErrorText = await notificationResponse.text();
      logStep("Notification email error", { status: notificationResponse.status, error: notificationErrorText });
    } else {
      logStep("Notification email sent to Andrew successfully");
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