import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTelegramMessage(chatId: number, text: string, buttons?: any[]) {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (buttons && buttons.length > 0) {
    body.reply_markup = {
      inline_keyboard: buttons.map((b: any) => [{ text: b.text, url: b.url || undefined, callback_data: b.callback_data || undefined }]),
    };
  }
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram error: ${err}`);
  }
  return res.json();
}

async function generatePersonalizedMessage(user: any, goal: string, tone: string): Promise<{ message: string; cta: string }> {
  const actions = user.actions || [];
  const actionList = actions.map((a: any) => a.action).join(", ");

  const stage = actions.length > 5 ? "hot" : actions.length > 2 ? "warm" : "cold";

  const prompt = `Ты — AI-ассистент, который пишет персональные сообщения в Telegram.

Задача: на основе данных пользователя написать короткое, живое сообщение, которое продолжает диалог и мягко ведёт к действию.

Данные пользователя:
- Имя: ${user.first_name || "друг"}
- Действия: ${actionList || "нет данных"}
- Стадия: ${stage}
- Источник: ${user.source || "organic"}
- Ниша: ${user.niche || "не указана"}
- Услуги: ${user.services || "не указаны"}

Цель рассылки: ${goal}
Тон: ${tone === "friendly" ? "дружелюбный" : tone === "selling" ? "продающий" : "мягкий"}

Правила:
- коротко (1–3 абзаца)
- без формальностей
- без "я видел твой профиль"
- ощущение личного сообщения
- не продавать в лоб
- используй имя пользователя

Формат ответа (строго JSON):
{"message": "текст сообщения", "cta": "текст кнопки"}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "personalized_message",
            description: "Return a personalized message and CTA button text",
            parameters: {
              type: "object",
              properties: {
                message: { type: "string" },
                cta: { type: "string" },
              },
              required: ["message", "cta"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "personalized_message" } },
      }),
    });

    if (!res.ok) {
      console.error("AI error:", await res.text());
      return { message: `Привет, ${user.first_name || "друг"}! 👋`, cta: "Узнать подробнее" };
    }

    const data = await res.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      return JSON.parse(toolCall.function.arguments);
    }

    return { message: `Привет, ${user.first_name || "друг"}! 👋`, cta: "Узнать подробнее" };
  } catch (e) {
    console.error("AI generation error:", e);
    return { message: `Привет, ${user.first_name || "друг"}! 👋`, cta: "Узнать подробнее" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { broadcast_id, action } = await req.json();

    if (action === "preview") {
      // Generate previews for AI-personalized broadcasts
      const { data: broadcast } = await supabase.from("broadcasts").select("*").eq("id", broadcast_id).single();
      if (!broadcast) throw new Error("Broadcast not found");

      const { data: recipients } = await supabase
        .from("broadcast_recipients")
        .select("telegram_id")
        .eq("broadcast_id", broadcast_id)
        .limit(3);

      const previews = [];
      for (const r of recipients || []) {
        const { data: user } = await supabase.from("bot_users").select("*").eq("telegram_id", r.telegram_id).single();
        const { data: actions } = await supabase.from("user_actions").select("action").eq("telegram_id", r.telegram_id).order("created_at", { ascending: false }).limit(10);

        const userData = { ...user, actions: actions || [] };
        const personalized = await generatePersonalizedMessage(userData, broadcast.ai_goal || "", broadcast.ai_tone || "friendly");
        previews.push({ telegram_id: r.telegram_id, name: user?.first_name, ...personalized });
      }

      return new Response(JSON.stringify({ previews }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Send broadcast
    const { data: broadcast } = await supabase.from("broadcasts").select("*").eq("id", broadcast_id).single();
    if (!broadcast) throw new Error("Broadcast not found");

    await supabase.from("broadcasts").update({ status: "sending" }).eq("id", broadcast_id);

    const { data: recipients } = await supabase
      .from("broadcast_recipients")
      .select("*")
      .eq("broadcast_id", broadcast_id)
      .eq("status", "pending");

    let sentCount = 0;
    let errorCount = 0;
    const BATCH_SIZE = 30;
    const DELAY_MS = 100; // 100ms between messages (Telegram limit ~30/sec)

    for (let i = 0; i < (recipients || []).length; i++) {
      const r = recipients![i];
      try {
        let messageText = broadcast.message_template || "";
        let buttons = broadcast.buttons || [];

        if (broadcast.type === "ai_personalized") {
          // Get user data & actions for personalization
          const { data: user } = await supabase.from("bot_users").select("*").eq("telegram_id", r.telegram_id).single();
          const { data: actions } = await supabase.from("user_actions").select("action").eq("telegram_id", r.telegram_id).order("created_at", { ascending: false }).limit(10);

          const userData = { ...user, actions: actions || [] };

          if (!r.personalized_message) {
            const personalized = await generatePersonalizedMessage(userData, broadcast.ai_goal || "", broadcast.ai_tone || "friendly");
            messageText = personalized.message;
            buttons = personalized.cta ? [{ text: personalized.cta, url: "https://petrfirstov.lovable.app/mini-app" }] : [];

            await supabase.from("broadcast_recipients").update({ personalized_message: messageText }).eq("id", r.id);
          } else {
            messageText = r.personalized_message;
          }
        }

        await sendTelegramMessage(r.telegram_id, messageText, buttons as any[]);
        await supabase.from("broadcast_recipients").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", r.id);
        sentCount++;
      } catch (e: any) {
        await supabase.from("broadcast_recipients").update({ status: "error", error_message: e.message }).eq("id", r.id);
        errorCount++;
      }

      // Delay between messages
      if (i < (recipients || []).length - 1) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }

      // Update progress every batch
      if ((i + 1) % BATCH_SIZE === 0) {
        await supabase.from("broadcasts").update({ sent_count: sentCount, error_count: errorCount }).eq("id", broadcast_id);
      }
    }

    await supabase.from("broadcasts").update({
      status: "completed",
      sent_count: sentCount,
      error_count: errorCount,
      completed_at: new Date().toISOString(),
    }).eq("id", broadcast_id);

    return new Response(JSON.stringify({ ok: true, sent: sentCount, errors: errorCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Broadcast error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
