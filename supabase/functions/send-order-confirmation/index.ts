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

    // Send order confirmation email using Mailchimp
    const mailchimpApiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const serverPrefix = mailchimpApiKey?.split('-')[1];
    
    const emailData = {
      type: "regular",
      recipients: {
        list_id: "YOUR_AUDIENCE_ID", // This should be set to actual audience ID
        segment_opts: {
          match: "any",
          conditions: []
        }
      },
      settings: {
        subject_line: `Order Confirmation - ${order.package_name}`,
        from_name: "Andrew - Nail Your Job Interview",
        reply_to: "andrew@nailyourjobinterview.com"
      },
      template: {
        id: 123456 // This should be replaced with actual template ID
      }
    };

    // Add customer to "Anticipate Interview Question Service" audience
    const mailchimpResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/d7102b6132/members`, {
      method: "PUT", // Changed to PUT to handle existing members
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: order.customer_email,
        status: "subscribed",
        merge_fields: {
          FNAME: order.customer_email.split('@')[0], // Default name
          ORDER_ID: orderId,
          PACKAGE: order.package_name,
          AMOUNT: (order.amount / 100).toFixed(2),
          INTAKE_LINK: `${req.headers.get("origin")}/intake-form?order_id=${orderId}`
        },
        tags: ["order_confirmation", "anticipate_questions"]
      }),
    });

    if (!mailchimpResponse.ok) {
      const errorText = await mailchimpResponse.text();
      logStep("Mailchimp API error", { status: mailchimpResponse.status, error: errorText });
      
      // Continue execution even if email fails
      console.warn("Email sending failed, but continuing");
    } else {
      logStep("Customer added to Mailchimp successfully");
    }

    // Send notification to Andrew via separate API call
    const notificationResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/d7102b6132/members/andrew@nailyourjobinterview.com`, {
      method: "PUT",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: "andrew@nailyourjobinterview.com",
        status: "subscribed",
        merge_fields: {
          FNAME: "Andrew",
          ORDER_ID: orderId,
          CUSTOMER_EMAIL: order.customer_email,
          PACKAGE: order.package_name,
          AMOUNT: (order.amount / 100).toFixed(2)
        },
        tags: ["new_order_notification"]
      }),
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