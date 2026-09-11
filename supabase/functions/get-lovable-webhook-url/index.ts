const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const secret = Deno.env.get("LV_WEBHOOK_SECRET") || "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const base = `${supabaseUrl}/functions/v1/lovable-webhook`;

  return new Response(
    JSON.stringify({
      ok: true,
      secret,
      url: `${base}?secret=${secret}`,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});