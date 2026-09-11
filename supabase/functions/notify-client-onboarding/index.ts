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
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
  return r.ok;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "👑 Владелец проекта",
  client: "👤 Клиент",
  viewer: "👁 Наблюдатель (только просмотр)",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { project_id, telegram_id, role = "client" } = await req.json();
    if (!project_id || !telegram_id) {
      return new Response(JSON.stringify({ error: "project_id and telegram_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("name, description, progress, scope_features")
      .eq("id", project_id)
      .single();

    if (!project) {
      return new Response(JSON.stringify({ error: "project not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const canEdit = role !== "viewer";
    const scope = (project.scope_features || []) as string[];
    const scopeBlock = scope.length
      ? `\n\n📋 <b>Что входит в MVP:</b>\n${scope.slice(0, 8).map((s) => `• ${s}`).join("\n")}${scope.length > 8 ? `\n…ещё ${scope.length - 8}` : ""}`
      : "";

    const text = `👋 <b>Добро пожаловать в проект «${project.name}»!</b>

${ROLE_LABEL[role] || ROLE_LABEL.client}
📈 Текущий прогресс: <b>${project.progress || 0}%</b>${project.description ? `\n\n📝 ${project.description}` : ""}${scopeBlock}

<b>Что вы можете делать прямо здесь, в боте:</b>

1️⃣ <b>📊 Мой проект</b> — посмотреть прогресс, последние обновления и границы MVP.
${canEdit ? `2️⃣ <b>✏️ Отправить правку</b> — опишите текстом или голосом, что поменять. AI разберёт, покажет «правильно ли понял?» и только после вашего подтверждения создаст задачу.
3️⃣ <b>📋 Мои задачи</b> — список всех ваших правок со статусами: 🆕 принята / ⚙️ в работе / 👀 на проверке / ✅ готово.
4️⃣ <b>🚀 Идеи улучшений</b> — AI подскажет, что ещё можно добавить.` : `2️⃣ <b>📋 Мои задачи</b> — следите за статусами правок: 🆕 / ⚙️ / 👀 / ✅.

⚠️ У вас роль наблюдателя — отправка правок недоступна.`}

💬 Можно просто писать в чат — AI-ассистент ответит по проекту, статусам и срокам.
🔔 Уведомления о готовых задачах придут сюда автоматически.
📅 Каждое утро — короткая сводка по проекту.

❓ Команда <b>/help</b> — подсказка в любой момент.

👇 Начнём?`;

    const keyboard = {
      inline_keyboard: canEdit
        ? [
            [{ text: "📊 Мой проект", callback_data: "client_project" }],
            [{ text: "✏️ Отправить первую правку", callback_data: "client_send_edit" }],
            [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
          ]
        : [
            [{ text: "📊 Мой проект", callback_data: "client_project" }],
            [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
          ],
    };

    const ok = await sendMessage(Number(telegram_id), text, { reply_markup: keyboard });

    return new Response(JSON.stringify({ ok, delivered: ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-client-onboarding error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});