import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "admin@petrfirstov.ru";
const ADMIN_PASSWORD = crypto.randomUUID(); // fallback, won't be used normally

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from("admin_login_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check token is not older than 5 minutes
    const createdAt = new Date(tokenData.created_at).getTime();
    if (Date.now() - createdAt > 5 * 60 * 1000) {
      await supabase.from("admin_login_tokens").update({ used: true }).eq("id", tokenData.id);
      return new Response(JSON.stringify({ error: "Token expired" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark token as used
    await supabase.from("admin_login_tokens").update({ used: true }).eq("id", tokenData.id);

    // Check if admin user exists
    const { data: users } = await supabase.auth.admin.listUsers();
    let adminUser = users?.users?.find((u: any) => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      // Create admin user
      const password = crypto.randomUUID();
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password,
        email_confirm: true,
      });
      if (createErr) {
        return new Response(JSON.stringify({ error: "Failed to create admin user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      adminUser = newUser.user;
    }

    // Generate a magic link for the admin
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: ADMIN_EMAIL,
    });

    if (linkErr || !linkData) {
      return new Response(JSON.stringify({ error: "Failed to generate session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract token hash from the link properties
    const tokenHash = linkData.properties?.hashed_token;

    return new Response(
      JSON.stringify({
        token_hash: tokenHash,
        email: ADMIN_EMAIL,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Admin auth error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
