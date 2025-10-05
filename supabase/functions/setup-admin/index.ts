import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Admin account already exists. Please sign in or reset password." 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@nailyourjobinterview.com",
      password: "kkbb1234",
      email_confirm: true,
    });

    if (authError) throw authError;

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        role: "admin",
      });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin account created. Please change your password immediately after first login.",
        email: "admin@nailyourjobinterview.com"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Setup admin error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
