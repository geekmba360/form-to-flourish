import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-ORDER-BY-SESSION] ${step}${detailsStr}`);
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

    const { sessionId } = await req.json();
    logStep("Received session ID", { sessionId });

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Query orders table to find the order by session ID using service role (bypasses RLS)
    const { data, error } = await supabaseClient
      .from('orders')
      .select('id, customer_email, package_name, amount, status')
      .eq('stripe_session_id', sessionId.trim())
      .maybeSingle();

    logStep("Database query result", { data, error });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      logStep("No order found for session ID", { sessionId });
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    logStep("Order found successfully", { orderId: data.id });

    return new Response(JSON.stringify({ order: data }), {
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