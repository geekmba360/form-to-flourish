import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const mailchimpApiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID") || "d7102b6132";

    if (!mailchimpApiKey) {
      logStep("WARNING: No Mailchimp API key found, skipping email notifications");
      return new Response(JSON.stringify({ success: true, warning: "Emails not sent - no API key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const serverPrefix = mailchimpApiKey.split('-')[1];

    // Update customer information in Mailchimp
    const customerName = formData.name || `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    const customerEmail = formData.email || order.customer_email;

    const customerUpdateData = {
      email_address: customerEmail,
      status: "subscribed",
      merge_fields: {
        FNAME: formData.firstName || formData.name || customerName,
        LNAME: formData.lastName || ""
      },
      tags: ["intake_completed"]
    };

    logStep("Updating customer information in Mailchimp", { email: customerEmail });

    const customerEmailResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerUpdateData),
    });

    if (!customerEmailResponse.ok) {
      const errorText = await customerEmailResponse.text();
      logStep("Customer email update failed", { status: customerEmailResponse.status, error: errorText });
    } else {
      logStep("Customer information updated in Mailchimp");
    }

    // Send notification to Andrew about completed intake
    const andrewNotificationData = {
      email_address: "andrew@nailyourjobinterview.com",
      status: "subscribed",
      merge_fields: {
        FNAME: "Andrew",
        LAST_CUSTOMER: customerName,
        CUSTOMER_EMAIL: customerEmail,
        ORDER_ID: orderId,
        PACKAGE: order.package_name,
        PHONE: formData.phone || formData.phoneNumber || "",
        LINKEDIN: formData.linkedin || formData.linkedinProfile || "",
        JOB_DESC: (formData.job_description || formData.jobDescriptionText || "").substring(0, 500),
        ADDITIONAL: (formData.additional_info || formData.additionalInformation || "").substring(0, 500)
      },
      tags: ["intake_completed_notification"]
    };

    const andrewNotificationResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`, {
      method: "POST",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(andrewNotificationData),
    });

    if (!andrewNotificationResponse.ok) {
      const errorText = await andrewNotificationResponse.text();
      logStep("Andrew notification failed", { status: andrewNotificationResponse.status, error: errorText });
    } else {
      logStep("Andrew notification sent successfully");
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