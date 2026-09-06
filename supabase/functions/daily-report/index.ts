import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendMessage(chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

Deno.serve(async (req) => {
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const since = yesterday.toISOString();

    // Gather stats
    const [newUsers, newLeads, newPartners, totalUsers, totalLeads, aiMessages, actions] = await Promise.all([
      supabase.from("bot_users").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("partners").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("bot_users").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("ai_conversations").select("*", { count: "exact", head: true }).eq("role", "user").gte("created_at", since),
      supabase.from("user_actions").select("*", { count: "exact", head: true }).gte("created_at", since),
    ]);

    // Active users (had actions today)
    const { data: activeData } = await supabase
      .from("bot_users")
      .select("*", { count: "exact", head: true })
      .gte("last_active_at", since);

    // Top actions
    const { data: topActions } = await supabase
      .from("user_actions")
      .select("action")
      .gte("created_at", since);

    const actionCounts: Record<string, number> = {};
    topActions?.forEach((a: any) => {
      actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    });
    const topActionsList = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => `  • ${action}: ${count}`)
      .join("\n");

    // Funnel temperature breakdown (новые за сутки)
    const { data: funnelRows } = await supabase
      .from("bot_users")
      .select("funnel_temp, entry_block")
      .gte("created_at", since);

    const TEMP_LABELS: Record<string, string> = {
      cold: "❄️ Холодные",
      warm: "🌤 Тёплые",
      hot: "🔥 Горячие",
      club: "🛠 В клуб",
      partner: "🤝 Партнёрство",
    };
    const tempCounts: Record<string, number> = {};
    const blockCounts: Record<string, number> = {};
    funnelRows?.forEach((u: any) => {
      const t = u.funnel_temp || "organic";
      tempCounts[t] = (tempCounts[t] || 0) + 1;
      if (u.entry_block) blockCounts[u.entry_block] = (blockCounts[u.entry_block] || 0) + 1;
    });
    const tempList = Object.entries(tempCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => `  ${TEMP_LABELS[t] || "🌐 Без метки"}: <b>${c}</b>`)
      .join("\n");
    const blockList = Object.entries(blockCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([b, c]) => `  • ${b}: ${c}`)
      .join("\n");

    // New leads details

    const { data: recentLeads } = await supabase
      .from("leads")
      .select("name, telegram, ref_code, status")
      .gte("created_at", since)
      .limit(5);

    const leadsDetails = recentLeads?.map((l: any) =>
      `  • ${l.name || "—"} (${l.telegram || "—"}) [${l.ref_code}] — ${l.status}`
    ).join("\n") || "  нет";

    const dateStr = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

    const report = `📊 <b>Ежедневный отчёт</b>
${dateStr}

👥 <b>Пользователи</b>
  Новых за сутки: <b>${newUsers.count || 0}</b>
  Активных за сутки: <b>${activeData || 0}</b>
  Всего: <b>${totalUsers.count || 0}</b>

📋 <b>Лиды</b>
  Новых за сутки: <b>${newLeads.count || 0}</b>
  Всего: <b>${totalLeads.count || 0}</b>
${leadsDetails !== "  нет" ? `\n  Последние:\n${leadsDetails}` : ""}

🤝 <b>Партнёры</b>
  Новых за сутки: <b>${newPartners.count || 0}</b>

🤖 <b>AI-диалоги</b>
  Сообщений за сутки: <b>${aiMessages.count || 0}</b>

📈 <b>Действия</b>
  Всего за сутки: <b>${actions.count || 0}</b>
${topActionsList ? `\n  Топ действий:\n${topActionsList}` : ""}`;

    await sendMessage(ADMIN_CHAT_ID, report);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Daily report error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
