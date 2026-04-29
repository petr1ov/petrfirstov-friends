import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendMessage(chatId: number, text: string, options: any = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { task_id } = await req.json();
    if (!task_id) {
      return new Response(JSON.stringify({ error: "task_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: task } = await supabase
      .from("tasks")
      .select("id, title, project_id, status")
      .eq("id", task_id)
      .single();

    if (!task) {
      return new Response(JSON.stringify({ error: "task not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id, name, telegram_id, progress")
      .eq("id", task.project_id)
      .single();

    if (!project) {
      return new Response(JSON.stringify({ error: "project not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = `✅ <b>Правки внесены!</b>

📦 Проект: <b>${project.name}</b>
📝 Задача: ${task.title}

📊 Прогресс проекта: <b>${project.progress}%</b>

👀 Проверьте, всё ли как задумано!`;

    // Collect all members (fallback to legacy telegram_id if no members yet)
    const { data: members } = await supabase
      .from("project_members")
      .select("telegram_id")
      .eq("project_id", project.id);

    const recipientIds = new Set<number>();
    (members || []).forEach((m: any) => m?.telegram_id && recipientIds.add(Number(m.telegram_id)));
    if (recipientIds.size === 0 && project.telegram_id) recipientIds.add(Number(project.telegram_id));

    const keyboard = {
      inline_keyboard: [
        [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
        [{ text: "📊 Мой проект", callback_data: "client_project" }],
        [{ text: "✏️ Отправить правку", callback_data: "client_send_edit" }],
      ],
    };

    for (const chatId of recipientIds) {
      await sendMessage(chatId, text, { reply_markup: keyboard });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-task-done error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});