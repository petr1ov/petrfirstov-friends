import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const WEBHOOK_SECRET = Deno.env.get("LV_WEBHOOK_SECRET")!;
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendMessage(chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("tg send error", e);
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const EVENT_LABEL: Record<string, { emoji: string; title: string }> = {
  "deploy.success": { emoji: "🚀", title: "Опубликована новая версия проекта" },
  "deploy.started": { emoji: "⚙️", title: "Идёт сборка новой версии" },
  "deploy.failed": { emoji: "⚠️", title: "Сборка завершилась с ошибкой" },
  "publish": { emoji: "🚀", title: "Опубликована новая версия проекта" },
  "preview": { emoji: "👁", title: "Обновлён превью-проект" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Проверяем секрет: либо в заголовке, либо в ?secret=
    const url = new URL(req.url);
    const provided = req.headers.get("x-lovable-secret") || url.searchParams.get("secret") || "";
    if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json().catch(() => ({}));
    console.log("lovable-webhook payload:", JSON.stringify(payload).slice(0, 800));

    // Универсальная распаковка: Lovable / ручной вызов
    const lovableProjectId: string | undefined =
      payload.project_id ||
      payload.projectId ||
      payload.project?.id ||
      payload.data?.project_id ||
      payload.data?.project?.id;

    const event: string =
      payload.event || payload.type || payload.action || "publish";

    const publishedUrl: string | undefined =
      payload.url || payload.published_url || payload.project?.url || payload.data?.url;

    const message: string | undefined =
      payload.message || payload.commit_message || payload.summary || payload.data?.message;

    if (!lovableProjectId) {
      return new Response(
        JSON.stringify({ error: "lovable project_id not found in payload", hint: "expected payload.project_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Находим проект по lovable_project_id
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, telegram_id")
      .eq("lovable_project_id", lovableProjectId)
      .maybeSingle();

    if (projErr) throw projErr;
    if (!project) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "no project linked", lovable_project_id: lovableProjectId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const label = EVENT_LABEL[event] || { emoji: "🔔", title: `Событие: ${event}` };

    // Обновим last_commit_message и last_commit_at, чтобы прогресс «жил» в карточке проекта
    const summary = message ? `${label.emoji} ${label.title} — ${message}` : `${label.emoji} ${label.title}`;
    await supabase
      .from("projects")
      .update({ last_commit_message: summary, last_commit_at: new Date().toISOString() })
      .eq("id", project.id);

    // Соберём список получателей: владелец + все участники проекта
    const recipients = new Set<number>();
    if (project.telegram_id) recipients.add(Number(project.telegram_id));
    const { data: members } = await supabase
      .from("project_members")
      .select("telegram_id")
      .eq("project_id", project.id);
    (members || []).forEach((m: any) => m.telegram_id && recipients.add(Number(m.telegram_id)));

    // Шлём только «важные» события (успех/ошибка), preview не спамим
    const notify = event !== "preview" && event !== "deploy.started";
    const text =
      `${label.emoji} <b>${escapeHtml(label.title)}</b>\n\n` +
      `📦 Проект: <b>${escapeHtml(project.name)}</b>` +
      (message ? `\n\n💬 ${escapeHtml(message)}` : "") +
      (publishedUrl ? `\n\n🔗 <a href="${escapeHtml(publishedUrl)}">Открыть</a>` : "") +
      `\n\n👉 В боте: «📊 Мой проект» — посмотреть прогресс и последние правки.`;

    let delivered = 0;
    if (notify) {
      for (const chatId of recipients) {
        await sendMessage(chatId, text);
        delivered++;
      }
    }

    // Admin — уведомляем всегда (даже preview), но кратко
    if (ADMIN_CHAT_ID) {
      const adminText =
        `${label.emoji} <b>${escapeHtml(project.name)}</b> — ${escapeHtml(label.title)}` +
        (message ? `\n💬 ${escapeHtml(message)}` : "") +
        (publishedUrl ? `\n🔗 ${escapeHtml(publishedUrl)}` : "");
      await sendMessage(Number(ADMIN_CHAT_ID), adminText);
    }

    return new Response(
      JSON.stringify({ ok: true, event, project_id: project.id, delivered, recipients: recipients.size }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("lovable-webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});