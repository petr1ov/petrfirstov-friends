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
const AITUNNEL_API_KEY = Deno.env.get("AITUNNEL_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const ADMIN_TELEGRAM_ID = 189415023;

// ====== MARKDOWN TO HTML CONVERTER ======

function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/__(.+?)__/g, "<b>$1</b>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

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

// ====== VOICE RECOGNITION ======

async function transcribeVoice(fileId: string): Promise<string> {
  if (!AITUNNEL_API_KEY) {
    console.error("AITUNNEL_API_KEY not set");
    return "";
  }

  try {
    // Get file path from Telegram
    const fileResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    });
    const fileData = await fileResp.json();
    if (!fileData.ok) {
      console.error("getFile failed:", JSON.stringify(fileData));
      return "";
    }

    const filePath = fileData.result.file_path;

    // Download the voice file
    const downloadResp = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    if (!downloadResp.ok) {
      console.error("Download failed:", downloadResp.status);
      return "";
    }
    const audioBytes = new Uint8Array(await downloadResp.arrayBuffer());

    // Send to Whisper via aitunnel
    const boundary = "----FormBoundary" + crypto.randomUUID().replace(/-/g, "");
    const encoder = new TextEncoder();

    const preamble = encoder.encode(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="voice.ogg"\r\nContent-Type: audio/ogg\r\n\r\n`,
    );
    const midPart = encoder.encode(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n--${boundary}--\r\n`,
    );

    const body = new Uint8Array(preamble.length + audioBytes.length + midPart.length);
    body.set(preamble, 0);
    body.set(audioBytes, preamble.length);
    body.set(midPart, preamble.length + audioBytes.length);

    const whisperResp = await fetch("https://api.aitunnel.ru/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AITUNNEL_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    if (!whisperResp.ok) {
      const errText = await whisperResp.text();
      console.error("Whisper error:", whisperResp.status, errText);
      return "";
    }

    const result = await whisperResp.json();
    return result.text || "";
  } catch (e) {
    console.error("transcribeVoice error:", e);
    return "";
  }
}

// ====== ADMIN AI HELPER ======

async function getAdminAIResponse(telegramId: number, userMessage: string): Promise<string> {
  if (!LOVABLE_API_KEY) return "AI-функция временно недоступна.";

  // Gather DB data for admin context
  const [usersRes, leadsRes, partnersRes, actionsRes] = await Promise.all([
    supabase
      .from("bot_users")
      .select("telegram_id, first_name, username, source, created_at, last_active_at, niche, services, goal")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("partners").select("*").order("created_at", { ascending: false }).limit(50),
    supabase
      .from("user_actions")
      .select("action, telegram_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const dbContext = `
ДАННЫЕ СИСТЕМЫ (актуальные):

Пользователи бота (последние 50):
${JSON.stringify(usersRes.data || [], null, 0)}

Лиды (последние 50):
${JSON.stringify(leadsRes.data || [], null, 0)}

Партнёры (последние 50):
${JSON.stringify(partnersRes.data || [], null, 0)}

Последние действия (100):
${JSON.stringify(actionsRes.data || [], null, 0)}
`;

  const systemPrompt = `Ты — AI-ассистент админа Петра Фирстова. Ты помогаешь управлять бизнесом.

Ты можешь:
— показывать списки пользователей, лидов, партнёров
— анализировать активность
— давать рекомендации по бизнесу
— отвечать на любые вопросы по данным

ВАЖНО: Форматируй ответ в HTML для Telegram. Используй <b>жирный</b> и <i>курсив</i>. НЕ используй Markdown.
Отвечай кратко и по делу.

${dbContext}`;

  const { data: history } = await supabase
    .from("ai_conversations")
    .select("role, content")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: true })
    .limit(10);

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
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      return "AI временно недоступен.";
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || "Не удалось получить ответ.";
    aiResponse = markdownToHtml(aiResponse);

    await supabase.from("ai_conversations").insert([
      { telegram_id: telegramId, role: "user", content: userMessage },
      { telegram_id: telegramId, role: "assistant", content: aiResponse },
    ]);

    return aiResponse;
  } catch (e) {
    console.error("Admin AI error:", e);
    return "Ошибка AI. Попробуйте позже.";
  }
}

// ====== AI HELPER ======

async function getAIResponse(telegramId: number, userMessage: string): Promise<string> {
  // If admin — use admin AI with DB access
  if (telegramId === ADMIN_TELEGRAM_ID) {
    return getAdminAIResponse(telegramId, userMessage);
  }

  if (!LOVABLE_API_KEY) return "AI-функция временно недоступна.";

  const { data: history } = await supabase
    .from("ai_conversations")
    .select("role, content")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: true })
    .limit(10);

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

ВАЖНО: Форматируй ответ в HTML для Telegram. Используй <b>жирный</b> и <i>курсив</i>. НЕ используй Markdown (**, __, *).

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
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      return "Извините, AI-ассистент временно недоступен. Напишите @petrfirstov напрямую.";
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || "Не удалось получить ответ.";
    aiResponse = markdownToHtml(aiResponse);

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
  return null;
}

// ====== MAIN BOT SCENARIOS ======

async function handleStart(chatId: number, firstName: string, startParam?: string) {
  if (startParam && startParam !== "") {
    const miniappSources: Record<string, string> = {
      miniapp_contact: "miniapp_contact",
      miniapp_launch: "miniapp_launch",
      miniapp_partner: "miniapp_partner",
      miniapp_calculator: "miniapp_calculator",
    };

    if (miniappSources[startParam]) {
      await trackAction(chatId, "miniapp_deeplink", { source: startParam });
      await supabase.from("bot_users").update({ source: startParam }).eq("telegram_id", chatId);

      if (startParam === "miniapp_partner") {
        await handleRegister(chatId, chatId, undefined);
        return;
      }
      if (startParam === "miniapp_calculator") {
        await handleWantBotcard(chatId);
        return;
      }
    } else if (!startParam.startsWith("ref_")) {
      await handleEventEntry(chatId, firstName, startParam);
      return;
    }
  }

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
        [{ text: "📊 Мой проект", callback_data: "client_project" }],
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

🎙 Можешь отправить голосовое сообщение — я тоже пойму!

👇 Просто напиши сообщение, и я отвечу как AI-ассистент`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Главное меню", callback_data: "start" }]],
    },
  });

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

  const { data: currentOffer } = await supabase
    .from("event_offers")
    .select("sold_count")
    .eq("event_code", eventCode)
    .single();

  await supabase
    .from("event_offers")
    .update({ sold_count: (currentOffer?.sold_count || 0) + 1 })
    .eq("event_code", eventCode);

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

  await sendMessage(
    ADMIN_CHAT_ID,
    `🔥 <b>Новая заявка с мероприятия!</b>\n\nИмя: ${firstName}\nUsername: @${username || "не указан"}\nСобытие: ${eventCode}\nЦена: ${offer.price} ₽\nУровень: ${offer.tier}`,
  );
}

// ====== PARTNER PROGRAM ======

async function handleRegister(chatId: number, telegramId: number, username: string | undefined) {
  const { data: existing } = await supabase.from("partners").select("*").eq("telegram_id", telegramId).single();

  if (existing) {
    const text = `✅ Вы уже зарегистрированы!

Ваш реферальный код: <code>${existing.ref_code}</code>
Ваша ссылка: <code>https://t.me/PetrFirstovBot?start=${existing.ref_code}</code>`;

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
  await supabase.from("bot_users").update({ goal: "register_name" }).eq("telegram_id", telegramId);
}

async function handleRegistrationName(chatId: number, telegramId: number, username: string | undefined, name: string) {
  if (!name || name.length < 2) {
    await sendMessage(chatId, "❌ Укажите корректное имя (минимум 2 символа)");
    return;
  }

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

  await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);

  const link = `https://t.me/PetrFirstovBot?start=${refCode}`;
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

🔗 Ссылка: <code>https://t.me/PetrFirstovBot?start=${partner.ref_code}</code>

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

  const link = partner ? `https://t.me/PetrFirstovBot?start=${partner.ref_code}` : "https://petrfirstov.ru";

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

async function handleAdminCommand(chatId: number, telegramId: number) {
  if (telegramId !== ADMIN_TELEGRAM_ID) {
    await sendMessage(chatId, "❌ У вас нет доступа к админ-панели.");
    return;
  }

  const token = crypto.randomUUID();
  await supabase.from("admin_login_tokens").insert({
    token,
    telegram_id: telegramId,
  });

  const loginUrl = `https://petrfirstov.lovable.app/admin-login?token=${token}`;

  await sendMessage(
    chatId,
    `🔐 <b>Вход в админ-панель</b>\n\nНажмите кнопку ниже для входа.\n⏳ Ссылка действительна 5 минут.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "🔓 Войти в админку", url: loginUrl }]],
      },
    },
  );
}

// ====== CLIENT PROJECT FLOW ======

async function getClientProject(telegramId: number) {
  // 1) Try via project_members (multi-user)
  const { data: memberRow } = await supabase
    .from("project_members")
    .select("role, project_id, projects(*)")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (memberRow?.projects) {
    const proj: any = memberRow.projects;
    proj._member_role = memberRow.role;
    return proj;
  }

  // 2) Fallback to legacy projects.telegram_id
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("telegram_id", telegramId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) (data as any)._member_role = "owner";
  return data;
}

function clientMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📊 Мой проект", callback_data: "client_project" }],
      [{ text: "✏️ Отправить правку", callback_data: "client_send_edit" }],
      [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
      [{ text: "🚀 Идеи улучшений", callback_data: "client_ideas" }],
      [{ text: "🔙 Главное меню", callback_data: "start" }],
    ],
  };
}

async function handleClientProject(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(
      chatId,
      `📭 У вас пока нет активных проектов.\n\nКак только Пётр заведёт ваш проект, он появится здесь.\n\n💡 Хотите заказать разработку?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
            [{ text: "🔙 Главное меню", callback_data: "start" }],
          ],
        },
      },
    );
    return;
  }

  const lastUpd = project.last_commit_at
    ? new Date(project.last_commit_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
    : "—";
  const lastMsg = project.last_commit_message ? `\n💬 ${project.last_commit_message}` : "";
  const scope = (project.scope_features || []) as string[];
  const scopeBlock = scope.length
    ? `\n\n📋 <b>Границы MVP:</b>\n${scope.slice(0, 6).map((s: string) => `• ${escapeHtml(s)}`).join("\n")}${scope.length > 6 ? `\n…ещё ${scope.length - 6}` : ""}`
    : "";
  const role = (project as any)._member_role;
  const roleLine = role === "viewer" ? "\n👁 Ваша роль: наблюдатель" : "";

  const text = `📊 <b>Проект: ${escapeHtml(project.name)}</b>

📈 Прогресс MVP: <b>${project.progress}%</b>
⚡ Статус: ${project.status === "active" ? "🟢 в работе" : project.status}
🕐 Последнее обновление: ${lastUpd}${lastMsg}${roleLine}${scopeBlock}

👇 Что хотите сделать?`;

  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "✏️ Отправить правку", callback_data: "client_send_edit" }],
        [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
        [{ text: "🚀 Идеи улучшений", callback_data: "client_ideas" }],
        [{ text: "🔙 Главное меню", callback_data: "start" }],
      ],
    },
  });
}

async function handleClientSendEdit(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(chatId, "📭 У вас нет активного проекта. Сначала Пётр заведёт его в системе.");
    return;
  }
  if ((project as any)._member_role === "viewer") {
    await sendMessage(
      chatId,
      "👁 У вас роль <b>наблюдателя</b> в этом проекте — отправка правок недоступна. Обратитесь к владельцу проекта.",
      { reply_markup: clientMenuKeyboard() },
    );
    return;
  }
  await supabase.from("bot_users").update({ goal: "client_edit" }).eq("telegram_id", telegramId);
  await sendMessage(
    chatId,
    `✏️ <b>Опишите правку для проекта «${project.name}»</b>\n\nНапишите свободным текстом или голосом — AI разберёт и подготовит задачу. Вы подтвердите перед отправкой в работу.\n\nНапример:\n• «Сделай кнопку зелёной и добавь оплату Stripe»\n• «На главной убери блок с ценами»`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Отмена", callback_data: "client_cancel" }]],
      },
    },
  );
}

async function handleClientCancel(chatId: number, telegramId: number) {
  await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);
  await sendMessage(chatId, "Отменено.", { reply_markup: clientMenuKeyboard() });
}

async function processClientEdit(chatId: number, telegramId: number, text: string) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(chatId, "📭 Проект не найден.");
    await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);
    return;
  }

  await sendMessage(chatId, "⏳ AI разбирает вашу правку...");

  try {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/parse-edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        text,
        project_id: project.id,
        project_context: `Название: ${project.name}${project.github_repo ? `, репо: ${project.github_repo}` : ""}`,
      }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      await sendMessage(chatId, `❌ ${err.error || "Не удалось обработать правку"}. Попробуйте позже.`);
      await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);
      return;
    }
    const parsed = await resp.json();

    // Сохраняем во временный draft через goal-стейт + поле в user_actions
    await supabase.from("user_actions").insert({
      telegram_id: telegramId,
      action: "edit_draft",
      metadata: parsed,
    });
    await supabase.from("bot_users").update({ goal: "client_edit_confirm" }).eq("telegram_id", telegramId);

    const stepsList = (parsed.steps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join("\n");

    await sendMessage(
      chatId,
      `🤖 <b>AI подготовил задачу:</b>\n\n📝 <b>${parsed.title}</b>\n\n<b>Шаги:</b>\n${stepsList}\n\n⚡ Приоритет: ${parsed.priority}\n\nВсё верно? Отправляем в работу?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Отправить в работу", callback_data: "client_edit_send" }],
            [{ text: "✏️ Переписать", callback_data: "client_send_edit" }],
            [{ text: "❌ Отменить", callback_data: "client_cancel" }],
          ],
        },
      },
    );
  } catch (e) {
    console.error("processClientEdit error:", e);
    await sendMessage(chatId, "❌ Ошибка обработки. Попробуйте позже.");
    await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);
  }
}

async function handleClientEditSend(chatId: number, telegramId: number) {
  // Берём последний draft из user_actions
  const { data: draftRow } = await supabase
    .from("user_actions")
    .select("metadata, created_at")
    .eq("telegram_id", telegramId)
    .eq("action", "edit_draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!draftRow?.metadata) {
    await sendMessage(chatId, "❌ Черновик не найден. Опишите правку заново.");
    return;
  }

  const draft: any = draftRow.metadata;
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(chatId, "❌ Проект не найден.");
    return;
  }

  const { error } = await supabase.from("tasks").insert({
    project_id: project.id,
    title: draft.title,
    steps: draft.steps || [],
    ai_instruction: draft.instruction_for_lovable,
    source_message: draft.source_message,
    priority: draft.priority || "normal",
    type: "edit",
    status: "new",
  });

  if (error) {
    console.error("create task error:", error);
    await sendMessage(chatId, "❌ Не удалось создать задачу.");
    return;
  }

  await supabase.from("bot_users").update({ goal: null }).eq("telegram_id", telegramId);

  await sendMessage(chatId, `✅ <b>Задача создана!</b>\n\n📝 ${draft.title}\n\nВы получите уведомление, когда правка будет готова.`, {
    reply_markup: clientMenuKeyboard(),
  });

  await sendMessage(
    ADMIN_CHAT_ID,
    `🆕 <b>Новая задача от клиента</b>\n\n📦 Проект: ${project.name}\n👤 От: ${telegramId}\n📝 ${draft.title}\n\nОткройте админку, чтобы взять в работу.`,
  );
}

async function handleClientTasks(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(chatId, "📭 У вас нет проектов.");
    return;
  }
  const { data: tasks } = await supabase
    .from("tasks")
    .select("title, status, priority, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(15);

  if (!tasks || tasks.length === 0) {
    await sendMessage(chatId, "📭 Задач пока нет.\n\nОтправьте первую правку 👇", {
      reply_markup: clientMenuKeyboard(),
    });
    return;
  }

  const statusEmoji: Record<string, string> = { new: "🆕", in_progress: "⚙️", review: "👀", done: "✅" };
  const list = tasks
    .map((t: any) => `${statusEmoji[t.status] || "•"} <b>${t.title}</b>`)
    .join("\n");

  await sendMessage(chatId, `📋 <b>Ваши задачи (${project.name})</b>\n\n${list}`, {
    reply_markup: clientMenuKeyboard(),
  });
}

async function handleClientIdeas(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(chatId, "📭 У вас нет проектов.");
    return;
  }

  await sendMessage(chatId, "⏳ AI генерирует идеи улучшений для вашего проекта...");

  if (!AITUNNEL_API_KEY) {
    await sendMessage(chatId, "AI временно недоступен.");
    return;
  }

  try {
    const resp = await fetch("https://api.aitunnel.ru/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${AITUNNEL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3.1-flash-lite-preview",
        max_tokens: 4000,
        messages: [
          {
            role: "system",
            content:
              "Ты — продуктовый AI-консультант. Сгенерируй 5 кратких, конкретных идей улучшений для проекта клиента. Верни строго через инструмент return_ideas.",
          },
          { role: "user", content: `Проект: ${project.name}. Прогресс: ${project.progress}%.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_ideas",
              description: "Возвращает список идей улучшений",
              parameters: {
                type: "object",
                properties: {
                  ideas: {
                    type: "array",
                    minItems: 3,
                    maxItems: 6,
                    items: {
                      type: "object",
                      properties: {
                        emoji: { type: "string", description: "Один эмодзи" },
                        title: { type: "string", description: "Короткий заголовок идеи (до 60 символов)" },
                        description: { type: "string", description: "Одно предложение пояснения (до 180 символов)" },
                      },
                      required: ["emoji", "title", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["ideas"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_ideas" } },
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("ideas AI error:", resp.status, errText);
      if (resp.status === 429) {
        await sendMessage(chatId, "⏳ Слишком много запросов к AI. Попробуйте через минуту.", {
          reply_markup: clientMenuKeyboard(),
        });
      } else if (resp.status === 402) {
        await sendMessage(chatId, "💳 AI-кредиты закончились. Сообщите администратору.", {
          reply_markup: clientMenuKeyboard(),
        });
      } else {
        await sendMessage(chatId, "❌ Не удалось сгенерировать идеи. Попробуйте позже.", {
          reply_markup: clientMenuKeyboard(),
        });
      }
      return;
    }
    const data = await resp.json();
    console.log("ideas AI response:", JSON.stringify(data).slice(0, 500));
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let ideas: Array<{ emoji: string; title: string; description: string }> = [];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (Array.isArray(args.ideas)) ideas = args.ideas;
      } catch (e) {
        console.error("ideas parse error:", e);
      }
    }
    if (ideas.length === 0) {
      await sendMessage(chatId, "❌ AI вернул пустой ответ. Попробуйте ещё раз.", {
        reply_markup: clientMenuKeyboard(),
      });
      return;
    }

    await sendMessage(chatId, `🚀 <b>Идеи улучшений для проекта «${project.name}»</b>\n\nНиже ${ideas.length} карточек — каждую можно добавить в задачи или скопировать.`);

    for (const idea of ideas) {
      const fullText = `${idea.emoji} ${idea.title}\n\n${idea.description}`;
      // Сохраняем идею, чтобы получить короткий id для callback_data
      const { data: saved, error: saveErr } = await supabase
        .from("user_actions")
        .insert({
          telegram_id: telegramId,
          action: "ai_idea",
          metadata: {
            project_id: project.id,
            emoji: idea.emoji,
            title: idea.title,
            description: idea.description,
          },
        })
        .select("id")
        .single();

      if (saveErr || !saved) {
        console.error("save idea error:", saveErr);
        continue;
      }
      const shortId = saved.id.replace(/-/g, "").slice(0, 24);
      // Кэш короткого id → uuid через ту же запись metadata.short
      await supabase
        .from("user_actions")
        .update({ metadata: { project_id: project.id, emoji: idea.emoji, title: idea.title, description: idea.description, short: shortId } })
        .eq("id", saved.id);

      const cardHtml = `${idea.emoji} <b>${escapeHtml(idea.title)}</b>\n\n${escapeHtml(idea.description)}`;
      await sendMessage(chatId, cardHtml, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Добавить в задачи", callback_data: `idea_add_${shortId}` },
              { text: "📋 Скопировать идею", callback_data: `idea_copy_${shortId}` },
            ],
          ],
        },
      });
    }

    await sendMessage(chatId, "👇 Выберите действие или вернитесь в меню", {
      reply_markup: clientMenuKeyboard(),
    });
  } catch (e) {
    console.error("ideas error:", e);
    await sendMessage(chatId, "❌ Ошибка генерации идей. Попробуйте позже.", {
      reply_markup: clientMenuKeyboard(),
    });
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function findIdeaByShortId(shortId: string, telegramId: number) {
  const { data } = await supabase
    .from("user_actions")
    .select("id, metadata")
    .eq("telegram_id", telegramId)
    .eq("action", "ai_idea")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!data) return null;
  return data.find((r: any) => r.metadata?.short === shortId) || null;
}

async function handleIdeaAdd(chatId: number, telegramId: number, shortId: string) {
  const row = await findIdeaByShortId(shortId, telegramId);
  if (!row) {
    await sendMessage(chatId, "⚠️ Идея не найдена. Сгенерируйте идеи заново.");
    return;
  }
  const meta = row.metadata as any;
  const { error } = await supabase.from("tasks").insert({
    project_id: meta.project_id,
    title: `${meta.emoji} ${meta.title}`,
    description: meta.description,
    status: "new",
    type: "idea",
    is_manual: true,
    source_message: "AI idea (client)",
  });
  if (error) {
    console.error("idea add error:", error);
    await sendMessage(chatId, "❌ Не удалось добавить идею в задачи.");
    return;
  }
  await sendMessage(chatId, `✅ Идея добавлена в задачи:\n\n${meta.emoji} <b>${escapeHtml(meta.title)}</b>`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 Мои задачи", callback_data: "client_tasks" }],
        [{ text: "🔙 В кабинет", callback_data: "client_menu" }],
      ],
    },
  });
}

async function handleIdeaCopy(chatId: number, telegramId: number, shortId: string) {
  const row = await findIdeaByShortId(shortId, telegramId);
  if (!row) {
    await sendMessage(chatId, "⚠️ Идея не найдена. Сгенерируйте идеи заново.");
    return;
  }
  const meta = row.metadata as any;
  const text = `${meta.emoji} ${meta.title}\n\n${meta.description}`;
  await sendMessage(
    chatId,
    `📋 <b>Скопируйте текст ниже</b> (зажмите → копировать):\n\n<code>${escapeHtml(text)}</code>`
  );
}

async function handleMyProjects(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (!project) {
    await sendMessage(
      chatId,
      `📭 У вас пока нет активных проектов в работе.\n\n💡 Хотите заказать разработку?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
            [{ text: "🔙 Главное меню", callback_data: "start" }],
          ],
        },
      },
    );
    return;
  }
  await handleClientProject(chatId, telegramId);
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
      } else if (data === "client_menu") {
        await sendMessage(chatId, "🏠 <b>Кабинет клиента</b>", { reply_markup: clientMenuKeyboard() });
      } else if (data === "client_project") {
        await handleClientProject(chatId, telegramId);
      } else if (data === "client_send_edit") {
        await handleClientSendEdit(chatId, telegramId);
      } else if (data === "client_edit_send") {
        await handleClientEditSend(chatId, telegramId);
      } else if (data === "client_cancel") {
        await handleClientCancel(chatId, telegramId);
      } else if (data === "client_tasks") {
        await handleClientTasks(chatId, telegramId);
      } else if (data === "client_ideas") {
        await handleClientIdeas(chatId, telegramId);
      } else if (data.startsWith("idea_add_")) {
        await handleIdeaAdd(chatId, telegramId, data.replace("idea_add_", ""));
      } else if (data.startsWith("idea_copy_")) {
        await handleIdeaCopy(chatId, telegramId, data.replace("idea_copy_", ""));
      }

      return new Response("OK", { headers: corsHeaders });
    }

    // Handle messages (text + voice)
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const username = msg.from.username;
      const firstName = msg.from.first_name || "";
      let text = msg.text || "";

      await trackUser(telegramId, firstName, username);

      // Handle voice messages
      if (msg.voice || msg.audio) {
        const fileId = msg.voice?.file_id || msg.audio?.file_id;
        if (fileId) {
          await trackAction(telegramId, "voice_message");
          const transcription = await transcribeVoice(fileId);
          if (transcription) {
            text = transcription;
          } else {
            await sendMessage(chatId, "❌ Не удалось распознать голосовое сообщение. Попробуйте написать текстом.");
            return new Response("OK", { headers: corsHeaders });
          }
        }
      }

      if (text.startsWith("/start")) {
        const startParam = text.split(" ")[1] || "";
        await trackAction(telegramId, "command:start", { param: startParam });
        await handleStart(chatId, firstName, startParam);
      } else if (text === "/admin") {
        await handleAdminCommand(chatId, telegramId);
      } else if (text === "/project" || text === "/myproject") {
        await handleMyProjects(chatId, telegramId);
      } else if (text) {
        // Check user state
        const { data: botUser } = await supabase
          .from("bot_users")
          .select("goal")
          .eq("telegram_id", telegramId)
          .single();

        if (botUser?.goal === "register_name") {
          await trackAction(telegramId, "registration:name");
          await handleRegistrationName(chatId, telegramId, username, text);
        } else if (botUser?.goal === "client_edit") {
          await trackAction(telegramId, "client_edit:text", { length: text.length });
          await processClientEdit(chatId, telegramId, text);
        } else if (botUser?.goal === "ai_chat" || !botUser?.goal) {
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
