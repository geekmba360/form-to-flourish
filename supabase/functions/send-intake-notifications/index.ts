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
    logStep("Received data", { orderId, customerName: `${formData.firstName} ${formData.lastName}` });

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
    const serverPrefix = mailchimpApiKey?.split('-')[1];

    // Send confirmation email to customer
    const customerEmailResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/YOUR_AUDIENCE_ID/members/${formData.email}`, {
      method: "PATCH",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merge_fields: {
          FNAME: formData.firstName,
          LNAME: formData.lastName,
          PHONE: formData.phoneNumber,
          LINKEDIN: formData.linkedinProfile || "",
          JOBDESC: formData.jobDescriptionText || formData.jobDescriptionLink || "",
          ADDITIONAL: formData.additionalInformation || ""
        },
        tags: ["intake_completed"]
      }),
    });

    if (!customerEmailResponse.ok) {
      logStep("Customer email update failed", { status: customerEmailResponse.status });
    } else {
      logStep("Customer information updated in Mailchimp");
    }

    // Send notification to Andrew about completed intake
    const andrewNotificationResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/YOUR_AUDIENCE_ID/members/andrew@nailyourjobinterview.com`, {
      method: "PATCH",
      headers: {
        "Authorization": `apikey ${mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merge_fields: {
          FNAME: "Andrew",
          LAST_CUSTOMER: `${formData.firstName} ${formData.lastName}`,
          CUSTOMER_EMAIL: formData.email,
          ORDER_ID: orderId,
          PACKAGE: order.package_name
        },
        tags: ["intake_completed_notification"]
      }),
    });

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