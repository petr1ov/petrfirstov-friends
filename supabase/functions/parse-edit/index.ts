import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SYSTEM_PROMPT = `Ты AI-ассистент для управления разработкой.

Твоя задача: превращать сообщения клиента в структурированные задачи для разработки и определять — входит ли задача в границы MVP (scope) или это улучшение сверх MVP (extra).

Правила:
- Пиши конкретно и технически
- Разбивай на шаги (3-7 пунктов)
- Указывай цвета (HEX), значения, конкретные API
- instruction_for_lovable должна быть готова для вставки в Lovable
- title — краткое название (до 80 символов)
- task_type:
  * "scope" — задача относится к одному из пунктов MVP (или scope не задан)
  * "extra" — задача явно выходит за границы MVP, это улучшение/новая фича
- НЕ добавляй текст вне вызова функции`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, project_id, project_context } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return new Response(JSON.stringify({ error: "text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = project_context
      ? `Контекст проекта: ${project_context}\n\nЗапрос клиента:\n${text}`
      : `Запрос клиента:\n${text}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_task",
              description: "Создать структурированную задачу разработки из запроса клиента",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Краткое название задачи (до 80 символов)" },
                  tasks: {
                    type: "array",
                    items: { type: "string" },
                    description: "Список конкретных шагов",
                  },
                  instruction_for_lovable: {
                    type: "string",
                    description: "Подробная инструкция для Lovable: что менять, где, какие значения",
                  },
                  priority: {
                    type: "string",
                    enum: ["low", "normal", "high"],
                    description: "Приоритет задачи",
                  },
                  task_type: {
                    type: "string",
                    enum: ["scope", "extra"],
                    description: "scope — входит в MVP, extra — улучшение сверх MVP",
                  },
                },
                required: ["title", "tasks", "instruction_for_lovable", "priority", "task_type"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_task" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Закончились AI-кредиты" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured task" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        title: parsed.title,
        steps: parsed.tasks,
        instruction_for_lovable: parsed.instruction_for_lovable,
        priority: parsed.priority || "normal",
        task_type: parsed.task_type === "extra" ? "extra" : "scope",
        source_message: text,
        project_id: project_id || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("parse-edit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});