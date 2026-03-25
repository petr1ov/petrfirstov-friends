import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ====== TELEGRAM API HELPERS ======

async function sendMessage(chatId: number | string, text: string, options: any = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", ...options }),
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}

// ====== TRACKING HELPERS ======

async function trackUser(telegramId: number, firstName: string, username?: string, source = "organic") {
  await supabase.from("bot_users").upsert(
    {
      telegram_id: telegramId,
      first_name: firstName,
      username: username || null,
      source,
      last_active_at: new Date().toISOString(),
    },
    { onConflict: "telegram_id" },
  );
}

async function trackAction(telegramId: number, action: string, metadata: any = {}) {
  await supabase.from("user_actions").insert({
    telegram_id: telegramId,
    action,
    metadata,
  });
}

// ====== AI HELPER ======

async function getAIResponse(telegramId: number, userMessage: string): Promise<string> {
  if (!LOVABLE_API_KEY) return "AI-функция временно недоступна.";

  // Get conversation history (last 10 messages)
  const { data: history } = await supabase
    .from("ai_conversations")
    .select("role, content")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: true })
    .limit(10);

  // Get user context
  const { data: botUser } = await supabase
    .from("bot_users")
    .select("niche, services, goal")
    .eq("telegram_id", telegramId)
    .single();

  const nicheContext = botUser?.niche ? `\nНиша пользователя: ${botUser.niche}` : "";
  const servicesContext = botUser?.services ? `\nУслуги пользователя: ${botUser.services}` : "";
  const goalContext = botUser?.goal ? `\nЦель пользователя: ${botUser.goal}` : "";

  const systemPrompt = `Ты — продающий ассистент эксперта Петра Фирстова, соло-разработчика ИИ-решений для экспертов и бизнеса.

Твоя задача:
— отвечать как эксперт в разработке Telegram-ботов, AI-ассистентов, сайтов, MVP
— вести диалог дружелюбно и профессионально
— подводить к заявке на проект
— показывать ценность автоматизации

Услуги Петра:
• Ботовизитка — от 10 000 ₽
• AI-бот (Telegram/VK/MAX) — от 15 000 ₽  
• Голосовой бот — от 20 000 ₽/мес
• Мини-приложение/сервис — от 30 000 ₽

Кейсы:
• Агрегатор мероприятий «Город+» — бот + сайт + админка + аналитика (≈80 000 ₽)
• AI-наставник в Telegram — ИИ-ассистент + личный кабинет + геймификация (≈120 000 ₽)
• Боты для экспертов — автоответы + сбор заявок + рост записей
• AI-ассистенты — 24/7 диалог + доведение до заявки

Сайт: https://petrfirstov.ru
${nicheContext}${servicesContext}${goalContext}

Отвечай кратко (до 300 слов), используй эмодзи. Если пользователь спрашивает о цене — давай диапазон и предлагай обсудить детали. В конце предлагай оставить заявку или написать @petrfirstov.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      return "Извините, AI-ассистент временно недоступен. Напишите @petrfirstov напрямую.";
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Не удалось получить ответ.";

    // Save conversation
    await supabase.from("ai_conversations").insert([
      { telegram_id: telegramId, role: "user", content: userMessage },
      { telegram_id: telegramId, role: "assistant", content: aiResponse },
    ]);

    return aiResponse;
  } catch (e) {
    console.error("AI error:", e);
    return "Извините, произошла ошибка. Напишите @petrfirstov напрямую.";
  }
}

// ====== EVENT OFFER LOGIC ======

async function getEventOffer(eventCode: string): Promise<{ price: number; spotsLeft: number; tier: string } | null> {
  const { data } = await supabase.from("event_offers").select("*").eq("event_code", eventCode).single();

  if (!data) return null;

  const sold = data.sold_count;
  if (sold < data.tier1_limit) {
    return { price: data.tier1_price, spotsLeft: data.tier1_limit - sold, tier: `Первые ${data.tier1_limit} человек` };
  } else if (sold < data.tier1_limit + data.tier2_limit) {
    return {
      price: data.tier2_price,
      spotsLeft: data.tier1_limit + data.tier2_limit - sold,
      tier: `Следующие ${data.tier2_limit}`,
    };
  } else if (sold < data.tier1_limit + data.tier2_limit + data.tier3_limit) {
    return {
      price: data.tier3_price,
      spotsLeft: data.tier1_limit + data.tier2_limit + data.tier3_limit - sold,
      tier: `Следующие ${data.tier3_limit}`,
    };
  }
  return null; // sold out
}

// ====== MAIN BOT SCENARIOS ======

async function handleStart(chatId: number, firstName: string, startParam?: string) {
  if (startParam && startParam !== "" && !startParam.startsWith("ref_")) {
    // Event scenario
    await handleEventEntry(chatId, firstName, startParam);
    return;
  }

  // Standard scenario
  const text = `Привет, ${firstName} 👋
Рад, что ты здесь!

Я уже настроил для тебя этот бот как пример того,
как можно автоматизировать привлечение клиентов 🤖

Здесь ты можешь:

— посмотреть, как работают AI-боты
— увидеть реальные кейсы
— понять, сколько это стоит
— и даже протестировать, как бот будет отвечать за тебя

💡 По сути, ты сейчас внутри готовой системы,
которую можно адаптировать под твой бизнес

👇 С чего начнём?`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Посмотреть кейсы", callback_data: "cases" }],
        [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
        [{ text: "💰 Сколько стоит", callback_data: "pricing" }],
        [{ text: "📱 Мини-приложение", url: "https://petrfirstov.lovable.app/mini-app" }],
        [{ text: "🚀 Стать партнёром", callback_data: "register" }],
      ],
    },
  });
}

async function handleEventEntry(chatId: number, firstName: string, eventCode: string) {
  const offer = await getEventOffer(eventCode);

  const text = `🔥 ${firstName}, ты с мероприятия?
Забери свой бонус!

Я делаю не просто ботов

👉 а систему, которая:
— приводит клиентов
— отвечает за тебя
— прогревает
— продаёт

И внутри:

• мини-приложение (как сайт)
• CRM с клиентами
• аналитика действий
• рассылки
• ИИ, который пишет персональные предложения
• ИИ-аватар, который отвечает за тебя

${offer ? `\n🎯 <b>Спецпредложение:</b>\n${offer.tier} — <b>${offer.price.toLocaleString("ru-RU")} ₽</b>\nОсталось мест: <b>${offer.spotsLeft}</b>` : "\n⏳ Все спецпредложения разобраны, но вы можете получить консультацию!"}`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔥 Забрать предложение", callback_data: `event_offer_${eventCode}` }],
        [{ text: "👀 Посмотреть как это работает", callback_data: "cases" }],
        [{ text: "💼 Кейсы", callback_data: "cases" }],
      ],
    },
  });
}

async function handleCases(chatId: number) {
  const text = `📊 <b>Кейсы</b>

📍 <b>Город+</b> — Агрегатор мероприятий
→ люди находят события
→ организаторы получают клиентов
✅ Telegram-бот + сайт + админ-панель + аналитика
💰 ≈ 80 000 ₽

📍 <b>Боты для экспертов</b>
→ автоматические ответы
→ сбор заявок
→ рост записей без ручной переписки
Примеры:
• ИИ-визитка для риелтора
• ИИ-визитка для эксперта по эмоциональному интеллекту

📍 <b>AI-ассистенты</b>
→ отвечают 24/7
→ ведут диалог
→ доводят до заявки
💰 ≈ 120 000 ₽

👇 Хотите попробовать как это работает?`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
        [{ text: "💰 Сколько стоит", callback_data: "pricing" }],
        [{ text: "🚀 Стать партнёром", callback_data: "register" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handlePricing(chatId: number) {
  const text = `💰 <b>Стоимость</b>

📱 <b>Ботовизитка</b> (вход в автоматизацию)
→ от 10 000 ₽

🤖 <b>AI-бот</b> (Telegram / VK / MAX)
→ от 15 000 ₽

🎙 <b>Голосовой бот</b>
→ от 20 000 ₽ / мес

📲 <b>Мини-приложение / сервис</b>
→ от 30 000 ₽

👇 Можно начать с простого и масштабировать

💡 <b>Что входит в ботовизитку:</b>
— бот с AI-ответами
— мини-приложение
— CRM
— аналитика`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔥 Хочу ботовизитку", callback_data: "want_botcard" }],
        [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
        [{ text: "💬 Задать вопрос AI", callback_data: "ai_chat" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleTryAI(chatId: number) {
  const text = `🤖 <b>Попробуй AI-ассистента</b>

Напиши любой вопрос, как будто ты клиент, а я — AI-бот эксперта.

Например:
• «Сколько стоит сделать бота?»
• «Мне нужен сайт для моего бизнеса»
• «Как AI может помочь моей компании?»

👇 Просто напиши сообщение, и я отвечу как AI-ассистент`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Главное меню", callback_data: "start" }]],
    },
  });

  // Set user state to AI mode
  await supabase.from("bot_users").update({ goal: "ai_chat" }).eq("telegram_id", chatId);
}

async function handleWantBotcard(chatId: number) {
  const text = `🎁 <b>Ботовизитка — ваш вход в автоматизацию</b>

Что вы получите:
✅ Telegram-бот с AI-ответами
✅ Мини-приложение (как современный сайт)
✅ CRM для управления клиентами
✅ Аналитика действий
✅ Настройка под вашу нишу

💰 <b>от 10 000 ₽</b>

Для заказа напишите @petrfirstov
или оставьте заявку прямо здесь 👇`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
        [{ text: "💬 Задать вопрос AI", callback_data: "ai_chat" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleLeaveRequest(chatId: number, telegramId: number, firstName: string, username?: string) {
  // Create lead from bot
  const { data: partner } = await supabase.from("partners").select("ref_code").eq("telegram_id", telegramId).single();

  await supabase.from("leads").insert({
    ref_code: partner?.ref_code || "direct_bot",
    name: firstName,
    telegram: username ? `@${username}` : String(telegramId),
    contact: username ? `@${username}` : String(telegramId),
    status: "new",
  });

  await sendMessage(
    chatId,
    `✅ <b>Заявка отправлена!</b>\n\nПётр свяжется с вами в ближайшее время.\n\nА пока можете попробовать AI-ассистента 👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );

  // Notify admin
  await sendMessage(
    ADMIN_CHAT_ID,
    `🆕 <b>Новая заявка из бота</b>\n\nИмя: ${firstName}\nUsername: @${username || "не указан"}\nTelegram ID: ${telegramId}`,
  );
}

async function handleEventOffer(
  chatId: number,
  telegramId: number,
  firstName: string,
  username: string | undefined,
  eventCode: string,
) {
  const offer = await getEventOffer(eventCode);
  if (!offer) {
    await sendMessage(
      chatId,
      "⏳ К сожалению, все места по спецпредложению заняты. Но мы можем обсудить индивидуальные условия!\n\nНапишите @petrfirstov",
    );
    return;
  }

  // Increment sold count
  const { data: currentOffer } = await supabase
    .from("event_offers")
    .select("sold_count")
    .eq("event_code", eventCode)
    .single();
  
  await supabase
    .from("event_offers")
    .update({ sold_count: (currentOffer?.sold_count || 0) + 1 })
    .eq("event_code", eventCode);

  // Create lead
  await supabase.from("leads").insert({
    ref_code: `event_${eventCode}`,
    name: firstName,
    telegram: username ? `@${username}` : String(telegramId),
    contact: username ? `@${username}` : String(telegramId),
    status: "new",
  });

  await sendMessage(
    chatId,
    `🎉 <b>Отлично, ${firstName}!</b>\n\nВы забронировали место по спецпредложению!\n\n💰 Цена: <b>${offer.price.toLocaleString("ru-RU")} ₽</b>\n\nПётр свяжется с вами в ближайшее время для обсуждения деталей.\n\n📩 Или напишите сами: @petrfirstov`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🤖 Попробовать AI пока ждём", callback_data: "try_ai" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );

  // Notify admin
  await sendMessage(
    ADMIN_CHAT_ID,
    `🔥 <b>Новая заявка с мероприятия!</b>\n\nИмя: ${firstName}\nUsername: @${username || "не указан"}\nСобытие: ${eventCode}\nЦена: ${offer.price} ₽\nУровень: ${offer.tier}`,
  );
}

// ====== PARTNER PROGRAM (existing) ======

async function handleRegister(chatId: number, telegramId: number, username: string | undefined) {
  const { data: existing } = await supabase.from("partners").select("*").eq("telegram_id", telegramId).single();

  if (existing) {
    const text = `✅ Вы уже зарегистрированы!

Ваш реферальный код: <code>${existing.ref_code}</code>
Ваша ссылка: <code>https://PetrFirstovBot/?ref=${existing.ref_code}</code>`;

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

  await sendMessage(chatId, "📝 Для регистрации укажите ваше <b>имя</b>:\n\n(Просто отправьте текстовое сообщение)");
  // Set state
  await supabase.from("bot_users").update({ goal: "register_name" }).eq("telegram_id", telegramId);
}

async function handleRegistrationName(chatId: number, telegramId: number, username: string | undefined, name: string) {
  if (!name || name.length < 2) {
    await sendMessage(chatId, "❌ Укажите корректное имя (минимум 2 символа)");
    return;
  }

  // Save name temporarily and ask for traffic source
  await supabase
    .from("bot_users")
    .update({ goal: `register_traffic:${name}` })
    .eq("telegram_id", telegramId);

  await sendMessage(chatId, `👋 Отлично, ${name}!\n\nКак вы планируете приводить клиентов?`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Знакомые", callback_data: `traffic_friends` }],
        [{ text: "📢 Telegram-канал", callback_data: `traffic_telegram` }],
        [{ text: "🏢 Агентство", callback_data: `traffic_agency` }],
        [{ text: "📈 Маркетинг / реклама", callback_data: `traffic_marketing` }],
        [{ text: "🔹 Другое", callback_data: `traffic_other` }],
      ],
    },
  });
}

async function completeRegistration(
  chatId: number,
  telegramId: number,
  username: string | undefined,
  name: string,
  trafficSource: string,
) {
  const refCode = `ref_${telegramId}`;
  const sourceMap: Record<string, string> = {
    friends: "Знакомые",
    telegram: "Telegram-канал",
    agency: "Агентство",
    marketing: "Маркетинг / реклама",
    other: "Другое",
  };

  const { error } = await supabase.from("partners").insert({
    name,
    telegram_id: telegramId,
    username: username || null,
    ref_code: refCode,
    traffic_source: sourceMap[trafficSource] || trafficSource,
  });

  if (error) {
    console.error("Registration error:", error);
    await sendMessage(chatId, "❌ Ошибка регистрации. Попробуйте позже.");
    return;
  }

  // Clear state
  await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);

  const link = `https://PetrFirstovBot/?ref=${refCode}`;
  await sendMessage(
    chatId,
    `🎉 <b>Регистрация завершена!</b>

Ваш реферальный код: <code>${refCode}</code>

🔗 <b>Ваша партнёрская ссылка:</b>
<code>${link}</code>

💰 Вознаграждение: <b>10–20%</b> с каждого проекта

Делитесь ссылкой — когда клиент оставит заявку, вы получите вознаграждение!`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Моя статистика", callback_data: "stats" }],
          [{ text: "📦 Материалы", callback_data: "materials" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );

  await sendMessage(
    ADMIN_CHAT_ID,
    `🆕 <b>Новый партнёр</b>\n\nИмя: ${name}\nUsername: @${username || "не указан"}\nИсточник: ${sourceMap[trafficSource] || trafficSource}\nКод: ${refCode}`,
  );
}

async function handleStats(chatId: number, telegramId: number) {
  const { data: partner } = await supabase.from("partners").select("*").eq("telegram_id", telegramId).single();

  if (!partner) {
    await sendMessage(chatId, "❌ Вы ещё не зарегистрированы как партнёр.", {
      reply_markup: {
        inline_keyboard: [[{ text: "🚀 Стать партнёром", callback_data: "register" }]],
      },
    });
    return;
  }

  const [clicks, leads, clients, payouts] = await Promise.all([
    supabase.from("clicks").select("*", { count: "exact", head: true }).eq("ref_code", partner.ref_code),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("ref_code", partner.ref_code),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("ref_code", partner.ref_code)
      .eq("status", "client"),
    supabase.from("payouts").select("amount").eq("partner_id", partner.id).eq("status", "paid"),
  ]);

  const totalIncome = payouts.data?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

  await sendMessage(
    chatId,
    `📊 <b>Ваша статистика</b>

🔗 Ссылка: <code>https://PetrFirstovBot/?ref=${partner.ref_code}</code>

👁 Переходы: <b>${clicks.count || 0}</b>
📋 Лиды: <b>${leads.count || 0}</b>
✅ Клиенты: <b>${clients.count || 0}</b>
💰 Доход: <b>${totalIncome.toLocaleString("ru-RU")} ₽</b>`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📦 Материалы", callback_data: "materials" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );
}

async function handleMaterials(chatId: number) {
  await sendMessage(chatId, `📦 <b>Материалы для партнёров</b>\n\nВыберите раздел:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 Описание услуг", callback_data: "mat_services" }],
        [{ text: "📁 Кейсы", callback_data: "cases" }],
        [{ text: "✍️ Текст для рекомендации", callback_data: "mat_recommend" }],
        [{ text: "🌐 Ссылка на сайт", callback_data: "mat_site" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleMaterialServices(chatId: number) {
  await sendMessage(
    chatId,
    `📋 <b>Описание услуг</b>

Пётр Фирстов — разработка цифровых продуктов:

🤖 <b>Telegram-боты</b> — автоматизация бизнеса, чат-боты, CRM-боты
🌐 <b>Сайты</b> — лендинги, корпоративные сайты, веб-приложения
🧠 <b>AI-ассистенты</b> — интеллектуальные помощники на базе GPT
🚀 <b>MVP стартапов</b> — быстрый запуск продукта от идеи до прототипа

📱 <b>Ботовизитка</b> — от 10 000 ₽
🤖 <b>AI-бот</b> — от 15 000 ₽
🎙 <b>Голосовой бот</b> — от 20 000 ₽/мес
📲 <b>Мини-приложение</b> — от 30 000 ₽`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
      },
    },
  );
}

async function handleMaterialRecommend(chatId: number, telegramId: number) {
  const { data: partner } = await supabase.from("partners").select("ref_code").eq("telegram_id", telegramId).single();

  const link = partner ? `https://PetrFirstovBot/?ref=${partner.ref_code}` : "https://petrfirstov.ru";

  await sendMessage(
    chatId,
    `✍️ <b>Текст для рекомендации</b>

Скопируйте и отправьте:

<i>Привет! Если тебе нужен Telegram-бот, сайт или AI-ассистент — рекомендую Петра Фирстова. Делает качественно, быстро и с AI. Вот ссылка: ${link}</i>`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
      },
    },
  );
}

// ====== MAIN HANDLER ======

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const update = await req.json();
    console.log("Telegram update:", JSON.stringify(update));

    // Handle callback queries
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const telegramId = cb.from.id;
      const username = cb.from.username;
      const firstName = cb.from.first_name || "";

      await answerCallbackQuery(cb.id);
      await trackUser(telegramId, firstName, username);
      await trackAction(telegramId, `button:${cb.data}`);

      const data = cb.data;

      if (data === "start") {
        await handleStart(chatId, firstName);
      } else if (data === "register") {
        await handleRegister(chatId, telegramId, username);
      } else if (data === "cases") {
        await handleCases(chatId);
      } else if (data === "pricing") {
        await handlePricing(chatId);
      } else if (data === "try_ai" || data === "ai_chat") {
        await handleTryAI(chatId);
      } else if (data === "want_botcard") {
        await handleWantBotcard(chatId);
      } else if (data === "leave_request") {
        await handleLeaveRequest(chatId, telegramId, firstName, username);
      } else if (data === "stats") {
        await handleStats(chatId, telegramId);
      } else if (data === "materials") {
        await handleMaterials(chatId);
      } else if (data === "mat_services") {
        await handleMaterialServices(chatId);
      } else if (data === "mat_recommend") {
        await handleMaterialRecommend(chatId, telegramId);
      } else if (data === "mat_site") {
        await sendMessage(chatId, "🌐 <b>Сайт:</b> https://petrfirstov.ru", {
          reply_markup: {
            inline_keyboard: [[{ text: "🔙 Материалы", callback_data: "materials" }]],
          },
        });
      } else if (data.startsWith("traffic_")) {
        const sourceKey = data.replace("traffic_", "");
        // Get name from bot_users goal field
        const { data: botUser } = await supabase
          .from("bot_users")
          .select("goal")
          .eq("telegram_id", telegramId)
          .single();
        const name = botUser?.goal?.replace("register_traffic:", "") || firstName;
        await completeRegistration(chatId, telegramId, username, name, sourceKey);
      } else if (data.startsWith("event_offer_")) {
        const eventCode = data.replace("event_offer_", "");
        await handleEventOffer(chatId, telegramId, firstName, username, eventCode);
      }

      return new Response("OK", { headers: corsHeaders });
    }

    // Handle text messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const username = msg.from.username;
      const firstName = msg.from.first_name || "";
      const text = msg.text || "";

      await trackUser(telegramId, firstName, username);

      if (text.startsWith("/start")) {
        const startParam = text.split(" ")[1] || "";
        await trackAction(telegramId, "command:start", { param: startParam });
        await handleStart(chatId, firstName, startParam);
      } else {
        // Check user state
        const { data: botUser } = await supabase
          .from("bot_users")
          .select("goal")
          .eq("telegram_id", telegramId)
          .single();

        if (botUser?.goal === "register_name") {
          await trackAction(telegramId, "registration:name");
          await handleRegistrationName(chatId, telegramId, username, text);
        } else if (botUser?.goal === "ai_chat" || !botUser?.goal) {
          // AI mode or default - send to AI
          await trackAction(telegramId, "ai_message", { length: text.length });
          const aiResponse = await getAIResponse(telegramId, text);
          await sendMessage(chatId, aiResponse, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
                [{ text: "🔙 Главное меню", callback_data: "start" }],
              ],
            },
          });
        } else {
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
