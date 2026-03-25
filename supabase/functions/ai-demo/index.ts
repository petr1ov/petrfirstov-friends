import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, history = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Ты — AI-демо ассистент эксперта Петра Фирстова, соло-разработчика ИИ-решений.

Твоя задача — показать, как AI-бот может отвечать клиентам за эксперта.
Отвечай кратко (до 150 слов), дружелюбно, профессионально.

Услуги:
• Ботовизитка — от 10 000 ₽
• AI-бот (Telegram/VK/MAX) — от 15 000 ₽
• Голосовой бот — от 20 000 ₽/мес
• Мини-приложение — от 30 000 ₽

Кейсы:
• Агрегатор «Город+» — бот + сайт + админка (≈80 000 ₽)
• AI-наставник — ИИ-ассистент + геймификация (≈120 000 ₽)
• Боты для экспертов — автоответы + сбор заявок

Используй эмодзи. В конце предлагай написать @petrfirstov для обсуждения.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Лимит запросов исчерпан" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Не удалось получить ответ.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
