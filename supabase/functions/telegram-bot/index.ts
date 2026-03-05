import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendMessage(chatId: number | string, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

// Registration state stored in memory (per function invocation - use DB for persistence)
// For simplicity, we'll use a DB table approach with partner status

async function handleStart(chatId: number, firstName: string) {
  const text = `🤝 <b>Партнёрская программа Петра Фирстова</b>

Зарабатывайте на рекомендациях разработки:
• Telegram-ботов
• сайтов
• AI-ассистентов
• MVP стартапов

💰 <b>Вознаграждение: 10–20% с каждого проекта</b>

Выберите действие:`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Стать партнёром", callback_data: "register" }],
        [{ text: "❓ Как это работает", callback_data: "how_it_works" }],
        [{ text: "📦 Материалы", callback_data: "materials" }],
        [{ text: "📊 Моя статистика", callback_data: "stats" }],
      ],
    },
  };

  await sendMessage(chatId, text, keyboard);
}

async function handleRegister(chatId: number, telegramId: number, username: string | undefined) {
  // Check if already registered
  const { data: existing } = await supabase
    .from("partners")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (existing) {
    const text = `✅ Вы уже зарегистрированы!

Ваш реферальный код: <code>${existing.ref_code}</code>
Ваша ссылка: <code>https://firstov.ai/?ref=${existing.ref_code}</code>`;

    await sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Моя статистика", callback_data: "stats" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    });
    return;
  }

  // Ask for name
  await sendMessage(chatId, "📝 Для регистрации укажите ваше <b>имя</b>:\n\n(Просто отправьте текстовое сообщение)");
}

async function handleRegistrationStep(chatId: number, telegramId: number, username: string | undefined, text: string) {
  // Check if already registered
  const { data: existing } = await supabase
    .from("partners")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (existing) return false;

  // Simple registration: use the text message as name, generate ref_code
  const name = text.trim();
  if (!name || name.length < 2) {
    await sendMessage(chatId, "❌ Пожалуйста, укажите корректное имя (минимум 2 символа)");
    return true;
  }

  // Generate unique ref_code
  const refCode = `ref_${telegramId}`;

  // Show traffic source selection
  await sendMessage(chatId, `👋 Отлично, ${name}!\n\nКак вы планируете приводить клиентов?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Знакомые", callback_data: `traffic_${name}_friends` }],
        [{ text: "📢 Telegram-канал", callback_data: `traffic_${name}_telegram` }],
        [{ text: "🏢 Агентство", callback_data: `traffic_${name}_agency` }],
        [{ text: "📈 Маркетинг / реклама", callback_data: `traffic_${name}_marketing` }],
        [{ text: "🔹 Другое", callback_data: `traffic_${name}_other` }],
      ],
    },
  });

  return true;
}

async function completeRegistration(chatId: number, telegramId: number, username: string | undefined, name: string, trafficSource: string) {
  const refCode = `ref_${telegramId}`;

  const { error } = await supabase.from("partners").insert({
    name,
    telegram_id: telegramId,
    username: username || null,
    ref_code: refCode,
    traffic_source: trafficSource,
  });

  if (error) {
    console.error("Registration error:", error);
    await sendMessage(chatId, "❌ Ошибка регистрации. Попробуйте позже.");
    return;
  }

  const link = `https://firstov.ai/?ref=${refCode}`;

  await sendMessage(chatId, `🎉 <b>Регистрация завершена!</b>

Ваш реферальный код: <code>${refCode}</code>

🔗 <b>Ваша партнёрская ссылка:</b>
<code>${link}</code>

Делитесь этой ссылкой с потенциальными клиентами. Когда кто-то перейдёт по ней и оставит заявку — вы получите вознаграждение!`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📊 Моя статистика", callback_data: "stats" }],
        [{ text: "📦 Материалы", callback_data: "materials" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });

  // Notify admin
  await sendMessage(ADMIN_CHAT_ID, `🆕 <b>Новый партнёр</b>\n\nИмя: ${name}\nUsername: @${username || "не указан"}\nИсточник: ${trafficSource}\nКод: ${refCode}`);
}

async function handleStats(chatId: number, telegramId: number) {
  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (!partner) {
    await sendMessage(chatId, "❌ Вы ещё не зарегистрированы как партнёр.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Стать партнёром", callback_data: "register" }],
        ],
      },
    });
    return;
  }

  const { count: clicksCount } = await supabase
    .from("clicks")
    .select("*", { count: "exact", head: true })
    .eq("ref_code", partner.ref_code);

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("ref_code", partner.ref_code);

  const { count: clientsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("ref_code", partner.ref_code)
    .eq("status", "client");

  const { data: payoutsData } = await supabase
    .from("payouts")
    .select("amount")
    .eq("partner_id", partner.id)
    .eq("status", "paid");

  const totalIncome = payoutsData?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

  const text = `📊 <b>Ваша статистика</b>

🔗 Ссылка: <code>https://firstov.ai/?ref=${partner.ref_code}</code>

👁 Переходы: <b>${clicksCount || 0}</b>
📋 Лиды: <b>${leadsCount || 0}</b>
✅ Клиенты: <b>${clientsCount || 0}</b>
💰 Доход: <b>${totalIncome.toLocaleString("ru-RU")} ₽</b>`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleHowItWorks(chatId: number) {
  const text = `❓ <b>Как работает партнёрская программа?</b>

1️⃣ Вы регистрируетесь и получаете персональную ссылку
2️⃣ Делитесь ссылкой с потенциальными клиентами
3️⃣ Клиент переходит по ссылке и оставляет заявку
4️⃣ Мы фиксируем лид и связываем с вами
5️⃣ Если клиент заказывает проект — вы получаете <b>10–20%</b> от стоимости

💡 <b>Чем больше клиентов вы приводите, тем больше зарабатываете!</b>

Средний чек проекта: 50 000 – 200 000 ₽
Ваш доход с одного клиента: 5 000 – 40 000 ₽`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Стать партнёром", callback_data: "register" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleMaterials(chatId: number) {
  const text = `📦 <b>Материалы для партнёров</b>

Выберите раздел:`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 Описание услуг", callback_data: "mat_services" }],
        [{ text: "📁 Кейсы", callback_data: "mat_cases" }],
        [{ text: "✍️ Текст для рекомендации", callback_data: "mat_recommend" }],
        [{ text: "🌐 Ссылка на сайт", callback_data: "mat_site" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleMaterialServices(chatId: number) {
  const text = `📋 <b>Описание услуг</b>

Пётр Фирстов — разработка цифровых продуктов:

🤖 <b>Telegram-боты</b> — автоматизация бизнеса, чат-боты, CRM-боты
🌐 <b>Сайты</b> — лендинги, корпоративные сайты, веб-приложения
🧠 <b>AI-ассистенты</b> — интеллектуальные помощники на базе GPT
🚀 <b>MVP стартапов</b> — быстрый запуск продукта от идеи до прототипа

Стоимость: от 30 000 ₽
Сроки: от 3 дней`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
    },
  });
}

async function handleMaterialCases(chatId: number) {
  const text = `📁 <b>Кейсы</b>

<b>Кейс 1: Агрегатор мероприятий «Город+»</b>
✅ Telegram-бот
✅ Сайт
✅ Админ-панель
✅ Система аналитики
💰 Стоимость проекта: ≈ 80 000 ₽

<b>Кейс 2: AI-наставник в Telegram</b>
✅ ИИ-ассистент
✅ Личный кабинет
✅ Геймификация
💰 Стоимость: ≈ 120 000 ₽`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
    },
  });
}

async function handleMaterialRecommend(chatId: number, telegramId: number) {
  const { data: partner } = await supabase
    .from("partners")
    .select("ref_code")
    .eq("telegram_id", telegramId)
    .single();

  const link = partner ? `https://firstov.ai/?ref=${partner.ref_code}` : "https://firstov.ai";

  const text = `✍️ <b>Текст для рекомендации</b>

Скопируйте и отправьте потенциальному клиенту:

<i>Привет! Если тебе нужен Telegram-бот, сайт, AI-ассистент или MVP — рекомендую обратиться к Петру Фирстову. Делает качественно и быстро. Вот ссылка: ${link}</i>`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log("Telegram update:", JSON.stringify(update));

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const telegramId = cb.from.id;
      const username = cb.from.username;
      const data = cb.data;

      await answerCallbackQuery(cb.id);

      if (data === "start") {
        await handleStart(chatId, cb.from.first_name);
      } else if (data === "register") {
        await handleRegister(chatId, telegramId, username);
      } else if (data === "how_it_works") {
        await handleHowItWorks(chatId);
      } else if (data === "materials") {
        await handleMaterials(chatId);
      } else if (data === "stats") {
        await handleStats(chatId, telegramId);
      } else if (data === "mat_services") {
        await handleMaterialServices(chatId);
      } else if (data === "mat_cases") {
        await handleMaterialCases(chatId);
      } else if (data === "mat_recommend") {
        await handleMaterialRecommend(chatId, telegramId);
      } else if (data === "mat_site") {
        await sendMessage(chatId, "🌐 <b>Сайт:</b> https://petrfirstov.ru", {
          reply_markup: {
            inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
          },
        });
      } else if (data.startsWith("traffic_")) {
        // traffic_{name}_{source}
        const parts = data.replace("traffic_", "");
        const lastUnderscore = parts.lastIndexOf("_");
        const name = parts.substring(0, lastUnderscore);
        const sourceMap: Record<string, string> = {
          friends: "Знакомые",
          telegram: "Telegram-канал",
          agency: "Агентство",
          marketing: "Маркетинг / реклама",
          other: "Другое",
        };
        const sourceKey = parts.substring(lastUnderscore + 1);
        const trafficSource = sourceMap[sourceKey] || sourceKey;
        await completeRegistration(chatId, telegramId, username, name, trafficSource);
      }

      return new Response("OK", { headers: corsHeaders });
    }

    // Handle text messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const username = msg.from.username;
      const text = msg.text || "";

      if (text === "/start") {
        await handleStart(chatId, msg.from.first_name);
      } else {
        // Try registration flow
        const handled = await handleRegistrationStep(chatId, telegramId, username, text);
        if (!handled) {
          await sendMessage(chatId, "Используйте /start для начала работы с ботом.");
        }
      }

      return new Response("OK", { headers: corsHeaders });
    }

    return new Response("OK", { headers: corsHeaders });
  } catch (err) {
    console.error("Error:", err);
    return new Response("OK", { headers: corsHeaders });
  }
});
