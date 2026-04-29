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

function fmtTask(t: { title: string; type?: string; planned_for_date?: string | null }) {
  const tag = t.type === "extra" ? "🎁" : "📋";
  const date = t.planned_for_date ? ` <i>(до ${t.planned_for_date})</i>` : "";
  return `${tag} ${t.title}${date}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, telegram_id, progress, mvp_completed_at, scope_features")
      .eq("status", "active");

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayStr = today.toISOString().slice(0, 10);
    let sent = 0;

    for (const p of projects || []) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, status, type, planned_for_date, completed_at")
        .eq("project_id", p.id);

      const list = tasks || [];
      const doneToday = list.filter((t) => t.status === "done" && t.completed_at && t.completed_at >= startOfDay);
      const inProgress = list.filter((t) => t.status === "in_progress");
      const planned = list.filter(
        (t) => t.status !== "done" && t.planned_for_date && t.planned_for_date >= todayStr,
      );

      // Skip silent days for projects with no activity
      if (doneToday.length === 0 && inProgress.length === 0 && planned.length === 0) continue;

      const parts: string[] = [];
      parts.push(`📊 <b>Отчёт по проекту: ${p.name}</b>`);
      parts.push(`📈 Прогресс MVP: <b>${p.progress}%</b>`);
      if (p.mvp_completed_at) parts.push(`✅ <b>MVP завершён!</b>`);
      parts.push("");

      if (doneToday.length > 0) {
        parts.push(`✅ <b>Сделано сегодня (${doneToday.length}):</b>`);
        doneToday.forEach((t) => parts.push(`  ${fmtTask(t as any)}`));
        parts.push("");
      }
      if (inProgress.length > 0) {
        parts.push(`⚙️ <b>В работе (${inProgress.length}):</b>`);
        inProgress.forEach((t) => parts.push(`  ${fmtTask(t as any)}`));
        parts.push("");
      }
      if (planned.length > 0) {
        parts.push(`📅 <b>Запланировано (${planned.length}):</b>`);
        planned.slice(0, 10).forEach((t) => parts.push(`  ${fmtTask(t as any)}`));
        parts.push("");
      }

      const { data: members } = await supabase
        .from("project_members")
        .select("telegram_id")
        .eq("project_id", p.id);

      const recipientIds = new Set<number>();
      (members || []).forEach((m: any) => m?.telegram_id && recipientIds.add(Number(m.telegram_id)));
      if (recipientIds.size === 0 && p.telegram_id) recipientIds.add(Number(p.telegram_id));

      const keyboard = {
        inline_keyboard: [
          [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
          [{ text: "📊 Мой проект", callback_data: "client_project" }],
        ],
      };
      const body = parts.join("\n").trim();
      for (const chatId of recipientIds) {
        await sendMessage(chatId, body, { reply_markup: keyboard });
        sent++;
      }
    }

    return new Response(JSON.stringify({ ok: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-client-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});