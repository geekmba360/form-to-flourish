import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
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

    const { packageId } = await req.json();
    logStep("Received package ID", { packageId });

    // Package pricing mapping
    const packages = {
      "anticipate": { name: "Anticipate Interview Questions", price: 7900 },
      "express": { name: "Express Interview Prep Package Plus", price: 74900 },
      "allin": { name: "All-In Interview Prep Package Plus", price: 167900 }
    };

    const selectedPackage = packages[packageId as keyof typeof packages];
    if (!selectedPackage) {
      throw new Error(`Invalid package ID: ${packageId}`);
    }
    logStep("Package validated", selectedPackage);

    // Check for authenticated user
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerEmail = "guest@example.com";

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      if (user?.email) {
        customerEmail = user.email;
      }
    }
    logStep("User authentication checked", { hasUser: !!user, email: customerEmail });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found, will create one in checkout");
    }

    // Create checkout session - allow customer to enter their own email for guest checkout
    const sessionConfig: any = {
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: selectedPackage.name },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      customer_creation: "always", // Allow guest users to have customer created
    };

    // Only set customer if we have an existing customer ID, otherwise let them enter their own email
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    logStep("Checkout session created", { sessionId: session.id });

    // Create order record in database
    const { error: insertError } = await supabaseClient.from("orders").insert({
      user_id: user?.id || null,
      customer_email: customerEmail,
      package_id: packageId,
      package_name: selectedPackage.name,
      amount: selectedPackage.price,
      currency: "usd",
      stripe_session_id: session.id,
      status: "pending",
    });

    if (insertError) {
      logStep("Database insert error", { error: insertError });
      throw new Error(`Failed to create order: ${insertError.message}`);
    }
    logStep("Order record created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
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