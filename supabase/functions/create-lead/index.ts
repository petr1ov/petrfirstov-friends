import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ref_code, name, telegram, contact } = await req.json();

    if (!ref_code || typeof ref_code !== "string" || ref_code.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid ref_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");

    const { error } = await supabase.from("leads").insert({
      ref_code,
      name: name?.substring(0, 100) || null,
      telegram: telegram?.substring(0, 100) || null,
      contact: contact?.substring(0, 200) || null,
    });

    if (error) {
      console.error("Insert lead error:", error);
      return new Response(JSON.stringify({ error: "Failed to create lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify admin via Telegram
    if (BOT_TOKEN && ADMIN_CHAT_ID) {
      const text = `🆕 <b>Новый лид</b>\n\nИсточник: ${ref_code}\nИмя: ${name || "не указано"}\nTelegram: ${telegram || "не указан"}\nКонтакт: ${contact || "не указан"}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: "HTML" }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
