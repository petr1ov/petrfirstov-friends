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
    .select("niche, services, goal, funnel_temp, entry_block")
    .eq("telegram_id", telegramId)
    .single();

  const nicheContext = botUser?.niche ? `\nНиша пользователя: ${botUser.niche}` : "";
  const servicesContext = botUser?.services ? `\nУслуги пользователя: ${botUser.services}` : "";
  const goalContext = botUser?.goal ? `\nЦель пользователя: ${botUser.goal}` : "";

  const tempStrategy: Record<string, string> = {
    cold:
      "Пользователь ХОЛОДНЫЙ: только знакомится. НЕ продавай, не называй цены первым. Задавай вопросы про его идею, давай пользу, покажи, что создать реально. Максимум — мягко предложи разобрать идею.",
    warm:
      "Пользователь ТЁПЛЫЙ: понимает зачем, хочет понять как. Объясняй шаги, приводи примеры похожих проектов, дай мини-разбор идеи. В конце — выбор: сообщество или обсудить проект с Петром.",
    hot:
      "Пользователь ГОРЯЧИЙ: хочет результат. Без философии. Уточняй задачу (что / зачем / срок), сразу давай вилку цены и срок, веди к заявке и разговору с Петром.",
    club:
      "Пользователь идёт в сообщество «Созидатели 2.0». Говори про самостоятельное создание, AI-наставника, шаблоны, первую неделю. Не переключай его на заказ под ключ, если он сам не попросит.",
    partner:
      "Пользователь интересуется партнёрством/амбассадорством. Объясняй, как получить ссылку, за что платят, какие проекты продавать проще всего.",
  };
  const funnelContext = botUser?.funnel_temp
    ? `\n\nВОРОНКА ВХОДА: ${botUser.funnel_temp}${botUser.entry_block ? ` (блок сайта: ${botUser.entry_block})` : ""}\n${tempStrategy[botUser.funnel_temp] || ""}`
    : "";


  const systemPrompt = `Ты — AI-напарник Петра Фирстова, создателя цифровых продуктов с AI.

Контекст проекта «FIRSTOV.AI»:
— Пётр создаёт продукты с AI и учит других создавать сам.
— Два пути для пользователя: «Создавать самому» (сообщество «Созидатели 2.0», AI-наставник, шаблоны) и «Обсудить проект» (готовый продукт под ключ: бот, CRM, AI-ассистент, мини-приложение, MVP за 14 дней).
— Главная идея: превратить идею человека в работающий продукт — с AI как напарником.

Твоя задача:
— отвечать как эксперт в создании Telegram-ботов, AI-ассистентов, сайтов, MVP
— вести диалог дружелюбно и по-доброму
— помогать пользователю выбрать путь: создавать самому или заказать у Петра
— подводить к действию: попробовать AI, зайти в сообщество, оставить заявку

Услуги Петра (под ключ):
• Ботовизитка — от 10 000 ₽
• AI-бот (Telegram/VK/MAX) — от 15 000 ₽
• Голосовой бот — от 20 000 ₽/мес
• Мини-приложение / сервис — от 30 000 ₽

Сайт: https://petrfirstov.ru
${nicheContext}${servicesContext}${goalContext}${funnelContext}

ВАЖНО: Форматируй ответ в HTML для Telegram. Используй <b>жирный</b> и <i>курсив</i>. НЕ используй Markdown (**, __, *).

Отвечай кратко (до 300 слов), используй эмодзи. Если пользователь спрашивает о цене — давай диапазон и предлагай обсудить детали. В конце предлагай: попробовать AI, зайти в сообщество «Созидатели 2.0» или оставить заявку.`;

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


// ====== FUNNEL (site → bot) ======

type FunnelTemp = "cold" | "warm" | "hot" | "club" | "partner";

const BLOCK_TITLES: Record<string, string> = {
  recognize: "«Узнаёшь себя?»",
  story: "«Моя история»",
  philosophy: "«Философия»",
  transformation: "«Что происходит с человеком»",
  offer: "«Что я предлагаю»",
  process: "«Как это работает»",
  build: "«Что можно создавать»",
  beyond: "«Это не только про AI»",
  cases: "«Кейсы»",
  calculator: "«Калькулятор проекта»",
  discuss: "«Обсудить проект»",
  contact: "кнопки «Написать»",
  creators: "«Созидатели 2.0»",
  difference: "«Главное отличие»",
  ambassador: "«Партнёрство»",
  start: "финального блока",
};

function parseFunnel(startParam: string): { temp: FunnelTemp; block: string } | null {
  const m = /^(cold|warm|hot|club|partner)_([a-z0-9]+)$/.exec(startParam);
  if (!m) return null;
  return { temp: m[1] as FunnelTemp, block: m[2] };
}

// Legacy deep links → новая схема воронок
const LEGACY_FUNNEL: Record<string, string> = {
  miniapp_start: "warm_start",
  miniapp_contact: "hot_contact",
  miniapp_launch: "warm_start",
  miniapp_calculator: "hot_calculator",
  miniapp_creators: "club_creators",
  miniapp_partner: "partner_ambassador",
};

async function handleFunnelEntry(chatId: number, firstName: string, temp: FunnelTemp, block: string) {
  await trackAction(chatId, "funnel_entry", { temp, block });
  await supabase
    .from("bot_users")
    .update({ source: `${temp}_${block}`, funnel_temp: temp, entry_block: block })
    .eq("telegram_id", chatId);

  const from = BLOCK_TITLES[block] ? ` из блока ${BLOCK_TITLES[block]}` : "";

  const tempLabel: Record<FunnelTemp, string> = {
    cold: "❄️ холодный",
    warm: "🌤 тёплый",
    hot: "🔥 горячий",
    club: "🛠 в клуб",
    partner: "🤝 партнёрство",
  };
  if (temp === "hot" || temp === "club" || temp === "partner") {
    await sendMessage(
      ADMIN_CHAT_ID,
      `🆕 <b>Новый заход с сайта</b>\n\nИмя: ${firstName}\nID: <code>${chatId}</code>\nТемпература: ${tempLabel[temp]}\nБлок: ${BLOCK_TITLES[block] || block}`,
    );
  }


  if (temp === "cold") {
    await sendMessage(
      chatId,
      `Привет, ${firstName} 👋\n\nВы пришли${from} — значит, что-то откликнулось.\n\nУ большинства людей есть идея, которая живёт в голове годами. Не хватает не таланта — хватает только первого шага.\n\n<b>Скажите одной фразой: что вы давно хотите создать?</b>\n\nНапишите текстом или голосом — я разберу вашу идею вместе с AI и покажу, как она может выглядеть на практике. Бесплатно, без обязательств.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🤖 Разобрать мою идею с AI", callback_data: "try_ai" }],
            [{ text: "📖 Философия и путь", callback_data: "creators" }],
            [{ text: "👇 Показать оба пути", callback_data: "main_menu" }],
          ],
        },
      },
    );
    return;
  }

  if (temp === "warm") {
    await sendMessage(
      chatId,
      `${firstName}, привет 👋\n\nВы зашли${from} — то есть уже понимаете «зачем» и хотите разобраться «как».\n\nКоротко, как это работает:\n1️⃣ Идея — вы описываете, что хотите\n2️⃣ AI-разбор — что реально нужно, а что лишнее\n3️⃣ Прототип за дни, не месяцы\n4️⃣ MVP, которым пользуются\n5️⃣ Дальше вы создаёте сами\n\n<b>Опишите вашу идею — сделаю мини-разбор прямо здесь.</b>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🤖 Мини-разбор идеи с AI", callback_data: "try_ai" }],
            [{ text: "🚀 Что можно создавать", callback_data: "what_to_build" }],
            [{ text: "🛠 Хочу создавать сам", callback_data: "creators" }],
            [{ text: "🤝 Обсудить проект со мной", callback_data: "discuss" }],
          ],
        },
      },
    );
    return;
  }

  if (temp === "hot") {
    await sendMessage(
      chatId,
      `${firstName}, здравствуйте 👋\n\nВы пришли${from} — значит, речь про конкретный проект. Не буду тратить ваше время на теорию.\n\n<b>Ответьте тремя строками:</b>\n1. Что нужно сделать?\n2. Для чего / какая задача бизнеса?\n3. Когда нужен результат?\n\nОриентиры по цене:\n• Ботовизитка — от 10 000 ₽\n• AI-бот — от 15 000 ₽\n• Голосовой бот — от 20 000 ₽\n• Мини-приложение / сервис — от 30 000 ₽\n• MVP под ключ — от 14 дней\n\nПосле ответа дам вилку по вашему проекту и предложу короткий разговор.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
            [{ text: "💰 Сколько стоит", callback_data: "pricing" }],
            [{ text: "📊 Кейсы", callback_data: "cases" }],
            [{ text: "👨‍💻 Написать Петру", url: "https://t.me/petrfirstov" }],
          ],
        },
      },
    );
    return;
  }

  if (temp === "club") {
    await handleCreators(chatId);
    await sendMessage(
      chatId,
      `Вы пришли${from}. Что будет у вас уже на первой неделе:\n\n✅ разобранная идея и понятный объём\n✅ первый работающий прототип\n✅ шаблон под ваш случай (бот / мини-приложение / CRM)\n✅ поддержка сообщества и AI-наставника\n\nЕсли хотите — начнём с разбора вашей идеи прямо сейчас.`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🤖 Разобрать идею с AI", callback_data: "try_ai" }],
            [{ text: "📱 Вступить в «Созидатели 2.0»", url: "https://petrfirstov.lovable.app/mini-app" }],
          ],
        },
      },
    );
    return;
  }

  // partner
  await sendMessage(
    chatId,
    `${firstName}, рад видеть 🤝\n\nВы пришли${from} — расскажу коротко, как работает партнёрство.\n\n• Вы получаете личную ссылку и делитесь ей\n• Каждый пришедший закрепляется за вами\n• Вы получаете вознаграждение с каждого оплаченного проекта\n• Средний проект — 15 000–120 000 ₽, значит и выплата ощутимая\n• Амбассадорам — приоритетная поддержка и материалы для контента\n\nСейчас оформлю вашу ссылку 👇`,
  );
  await handleRegister(chatId, chatId, undefined);
}

// ====== MAIN BOT SCENARIOS ======

async function handleStart(chatId: number, firstName: string, startParam?: string) {
  if (startParam && startParam !== "" && !startParam.startsWith("ref_")) {
    // 1) Точные сценарии с сайта (тарифы, кейсы, калькулятор, контакт, партнёрка, манифест)
    const handled = await handleScenarioEntry(chatId, firstName, startParam);
    if (handled) return;

    // 2) Общая логика воронок по «температуре»
    const normalized = LEGACY_FUNNEL[startParam] || startParam;
    const funnel = parseFunnel(normalized);
    if (funnel) {
      await handleFunnelEntry(chatId, firstName, funnel.temp, funnel.block);
      return;
    }
  }

  // Прогрев — узнай себя
  await sendMessage(
    chatId,
    `Привет, ${firstName} 👋\n\nУзнаёшь себя?\n\n💡 Идея крутится в голове уже давно\n🤔 Знаешь, что хочешь создать, но не хватает ресурса\n⚡ Хочешь свой продукт — бот, сервис, AI-ассистент\n\nИ главное — хочешь не просто заказать, а создавать сам.`,
  );

  // Два пути
  await sendMessage(
    chatId,
    `Я — Пётр Фирстов. Создаю цифровые продукты с AI и учу этому.\n\nТут два пути:\n\n🛠 <b>Создавать самому</b> — с AI как напарником, в сообществе «Созидатели 2.0». От идеи до MVP своими руками.\n\n🤝 <b>Обсудить проект со мной</b> — готовый продукт под ключ: бот, CRM, AI-ассистент, мини-приложение.\n\nОба пути — про одно: превратить идею в работающий продукт.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛠 Хочу создавать сам", callback_data: "creators" }],
          [{ text: "🤝 Обсудить проект", callback_data: "discuss" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "🤝 Стать партнёром", callback_data: "register" }],
          [{ text: "📱 Мини-приложение", url: "https://petrfirstov.lovable.app/mini-app" }],
        ],
      },
    },
  );
}


// Компактное главное меню (возврат из разделов)
async function handleMainMenu(chatId: number) {
  await sendMessage(
    chatId,
    `👇 Выберите путь:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📋 Тарифы", callback_data: "tariffs" }],
          [{ text: "🛠 Хочу создавать сам", callback_data: "creators" }],
          [{ text: "🤝 Обсудить проект", callback_data: "discuss" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "📊 Кейсы", callback_data: "cases" }],
          [{ text: "📜 Манифест", callback_data: "manifesto" }],
          [{ text: "📊 Мой проект", callback_data: "client_project" }],
          [{ text: "🚀 Стать партнёром", callback_data: "register" }],
        ],
      },
    },
  );
}

// Путь 1 — Создавать самому
async function handleCreators(chatId: number) {
  await sendMessage(
    chatId,
    `🛠 <b>Создавай сам — с AI и сообществом</b>\n\n«Созидатели 2.0» — для тех, кто хочет создавать свои продукты с помощью AI, а не просто заказывать.\n\nЧто внутри:\n• AI-наставник — разбирает идею и ведёт по шагам\n• Готовые шаблоны: бот, мини-приложение, CRM\n• Сообщество тех, кто уже создаёт\n• Путь: идея → прототип → MVP → самостоятельное создание\n\nГлавное: ты учишься создавать сам. AI — напарник, не замена.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Что можно создавать", callback_data: "what_to_build" }],
          [{ text: "⚙️ Как это работает", callback_data: "process" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "📱 В сообщество", url: "https://petrfirstov.lovable.app/mini-app" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );
}

async function handleWhatToBuild(chatId: number) {
  await sendMessage(
    chatId,
    `🚀 <b>Что можно создавать с AI</b>\n\n• <b>Telegram-боты</b> — автоответы, воронки, заявки\n• <b>AI-ассистенты</b> — 24/7 диалог, доведение до заявки\n• <b>Мини-приложения</b> — как сайт, прямо в Telegram\n• <b>CRM и аналитика</b> — клиенты и цифры в одном месте\n• <b>MVP стартапа</b> — от идеи до работающего продукта\n• <b>Голосовые боты</b> — распознают речь и отвечают\n\nПо сути — любой цифровой продукт. AI ускоряет каждый шаг.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚙️ Как это работает", callback_data: "process" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "🔙 Назад", callback_data: "creators" }],
        ],
      },
    },
  );
}

async function handleProcess(chatId: number) {
  await sendMessage(
    chatId,
    `⚙️ <b>Как это работает — 5 шагов</b>\n\n1️⃣ <b>Идея</b> — описываешь, что хочешь создать\n2️⃣ <b>AI-разбор</b> — AI помогает понять, что реально нужно\n3️⃣ <b>Прототип</b> — первый работающий вариант за дни, не месяцы\n4️⃣ <b>MVP</b> — продукт, которым пользуются\n5️⃣ <b>Самостоятельность</b> — ты создаёшь следующее сам\n\nКаждый шаг — с AI как напарником и поддержкой сообщества.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Что можно создавать", callback_data: "what_to_build" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "🔙 Назад", callback_data: "creators" }],
        ],
      },
    },
  );
}

// Путь 2 — Обсудить проект
async function handleDiscussProject(chatId: number) {
  await sendMessage(
    chatId,
    `🤝 <b>Обсудим твой проект</b>\n\nЕсли нужен готовый продукт под ключ — я сделаю:\n• Telegram-боты и AI-ассистенты\n• Мини-приложения и сервисы\n• CRM и автоматизацию\n• MVP от идеи до запуска за 14 дней\n\nДавай посмотрим кейсы и прикинем стоимость 👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Кейсы", callback_data: "cases" }],
          [{ text: "💰 Сколько стоит", callback_data: "pricing" }],
          [{ text: "🎁 Ботовизитка", callback_data: "want_botcard" }],
          [{ text: "📝 Оставить заявку", callback_data: "leave_request" }],
          [{ text: "🤖 Попробовать AI", callback_data: "try_ai" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );
}

// ====== СЦЕНАРИИ С САЙТА ======

const BACK_MENU = { text: "🔙 Главное меню", callback_data: "start" };

// --- Тарифы ---

const TARIFFS: Record<string, { title: string; text: string }> = {
  base: {
    title: "1️⃣ БАЗА — сообщество и база знаний",
    text: `1️⃣ <b>БАЗА — сообщество и база знаний</b>
💰 <b>1 000 ₽ / месяц</b>

Для тех, кто хочет быть внутри сообщества и брать готовые проверенные решения.

<b>Закрытое сообщество:</b>
• Закрытый чат предпринимателей и созидателей
• Общение и обмен живым практическим опытом
• Реальные кейсы участников клуба
• Помощь, ответы на вопросы и новые находки

<b>Библиотека решений (Skills):</b>
• Готовые инструкции и шаблоны под конкретные задачи
• Автоматизация продаж и рассылок
• Генерация контента и связки с сервисами
• Сборка первых рабочих MVP без кода
• Принцип: один нашёл решение → доступно всему клубу

Если пока хочется наблюдать, пробовать и брать готовые решения — этого тарифа достаточно.`,
  },
  agent: {
    title: "2️⃣ AI-АГЕНТ — персональная AI-система",
    text: `2️⃣ <b>AI-АГЕНТ — персональная AI-система</b>
🔥 Хит • выбор созидателей
💰 <b>5 000 ₽ разово</b> + расход токенов по факту и 500 ₽/мес за выделенный сервер

Всё из «Базы» + создание вашего персонального агента, который учится под вас.

<b>Персональная настройка:</b>
• Под ваш бизнес, процессы и стиль
• Интеграция с вашими инструментами и правилами
• Не универсальный чат-бот, а личный цифровой сотрудник

<b>Накопление вашего контекста:</b>
• База знаний о вас: документы, промпты, регламенты
• История проектов, экспериментов и личных Skills
• Чем дольше работает — тем ценнее система

<b>Данные остаются у вас:</b>
• Никакой привязки к закрытой платформе
• Базу можно забрать и перенести в любую систему

Вы не арендуете агента — вы строите собственный цифровой капитал, который остаётся с вами навсегда.`,
  },
  partner: {
    title: "3️⃣ AI-ПАРТНЁР — экосистема и поток проектов",
    text: `3️⃣ <b>AI-ПАРТНЁР — экосистема и поток проектов</b>
📈 Максимальный рост
💰 <b>10 000 ₽ / месяц</b>

Всё из «Базы» и «Агента» + доступ к потоку реальных заказов и клиентам клуба.

<b>Поток лидов и клиентов:</b>
• Передаём подходящие клиентские запросы участникам
• Нужен бот, CRM или автоворонка → отдаём мастеру внутри клуба
• Приоритетное распределение внешних заказов

<b>Партнёрство и монетизация:</b>
• Участие в коммерческих продуктах клуба
• Продажа своих Skills и решений другим участникам
• Коллаборации и объединение компетенций
• Процент с реализованных проектов

<b>Полный стек:</b>
• Всё из «Базы» и «AI-Агента»
• Прямой контакт с основателем и менторство

Вы становитесь не просто участником клуба, а активным партнёром коммерческой AI-экосистемы.`,
  },
};

const TARIFF_CTA: Record<string, string> = {
  base: "✅ Войти в сообщество",
  agent: "🤖 Подключить AI-агента",
  partner: "🤝 Стать AI-партнёром",
};

async function handleTariff(chatId: number, key: string) {
  const t = TARIFFS[key];
  if (!t) return handleTariffsAll(chatId);
  await sendMessage(chatId, t.text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: TARIFF_CTA[key] ?? "📝 Оставить заявку", callback_data: "leave_request" }],
        [{ text: "📋 Все тарифы", callback_data: "tariffs" }],
        [{ text: "💬 Задать вопрос AI", callback_data: "try_ai" }],
        [BACK_MENU],
      ],
    },
  });
}

async function handleTariffsAll(chatId: number) {
  await sendMessage(
    chatId,
    `📋 <b>Три уровня участия в клубе</b>

1️⃣ <b>БАЗА</b> — 1 000 ₽/мес
Закрытое сообщество + библиотека готовых решений (Skills).

2️⃣ <b>AI-АГЕНТ</b> — 5 000 ₽ разово 🔥 хит
Всё из «Базы» + личный AI-агент под ваш бизнес. Плюс токены по факту и 500 ₽/мес за сервер.

3️⃣ <b>AI-ПАРТНЁР</b> — 10 000 ₽/мес
Всё из «Базы» и «Агента» + поток реальных заказов и клиентов клуба.

Нужен продукт под ключ, а не участие в клубе? Нажмите «Рассчитать проект».

Выберите, что разобрать подробнее 👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "1️⃣ База — 1 000 ₽/мес", callback_data: "tariff_base" }],
          [{ text: "2️⃣ AI-агент — 5 000 ₽", callback_data: "tariff_agent" }],
          [{ text: "3️⃣ AI-партнёр — 10 000 ₽/мес", callback_data: "tariff_partner" }],
          [{ text: "🧮 Рассчитать проект под ключ", callback_data: "calculator" }],
          [{ text: "💬 Задать вопрос AI", callback_data: "try_ai" }],
          [BACK_MENU],
        ],
      },
    },
  );
}

// --- Кейсы: свой ответ под каждый ---

const CASE_SCRIPTS: Record<string, string> = {
  a5d8ec08: `🏆 <b>Клуб предпринимателей «ПЕРВЫЕ»</b>

Что сделали: Telegram Mini App с каталогом резидентов, AI-подбором партнёров по запросу, баллами за активность и админкой для модерации и рассылок.

Результат: +340% вовлечённости резидентов, 90% рутины комьюнити-менеджера — на автомате.
💰 200 000 ₽

Соберём аналог под вас: клуб, сообщество, нетворкинг-платформа. Напишите, что у вас за сообщество и сколько людей — дам вилку и срок.`,
  f03f628e: `🧘 <b>EBD Mind — платформа женских практик</b>

Что сделали: приложение-плеер медитаций с оффлайн-режимом, бот с ежедневными голосовыми настроями, генерацию персональных медитаций под состояние и подписки с оплатой.

Результат: 1 800+ активных подписок за 3 месяца.
💰 200 000 ₽

Соберём аналог под вас: практики, курсы, аудио-контент по подписке. Расскажите про ваш контент — прикину объём.`,
  "80d737ef": `📍 <b>Город+ — навигатор событий города</b>

Что сделали: бот с быстрым поиском событий, мини-приложение с расписанием, фильтрами и картой, кабинет организаторов и CRM по билетам.

Результат: 12 000+ просмотров событий в месяц, поиск события — 30 секунд.
💰 150 000 ₽

Соберём аналог под вас: афиша, каталог, маркетплейс услуг. Напишите вашу нишу.`,
  "46376595": `🎭 <b>Бронирование детских шоу</b>

Что сделали: пошаговый калькулятор программы с моментальным расчётом, автоматический договор и счёт в PDF, бронь артистов и уведомления менеджерам.

Результат: конверсия из расчёта в заявку выросла с 14% до 38%.
💰 150 000 ₽

Соберём аналог под вас: услуги с расчётом стоимости и расписанием. Опишите, как считаете цену сейчас.`,
  de8e5c03: `🕉 <b>Школа аштанга-йоги</b>

Что сделали: мини-приложение с сеткой расписания, учёт занятий по абонементам, напоминания за 2 часа до практики и панель преподавателей.

Результат: пропуски без предупреждения снизились на 70%.
💰 100 000 ₽

Соберём аналог под вас: студия, школа, секция, любые групповые занятия. Сколько у вас занятий в неделю?`,
  b6d2e2be: `🌿 <b>Магазин аюрведических препаратов</b>

Что сделали: каталог с поиском по симптомам, AI-подбор трав, заказ в 2 клика внутри Telegram, трекинг доставки СДЭК и CRM с историей покупок.

Результат: средний чек вырос на 28%.
💰 50 000 ₽

Соберём аналог под вас: магазин прямо в Telegram. Сколько у вас товаров?`,
  "6b902e53": `🏠 <b>ИИ-визитка риелтора</b>

Что сделали: каталог объектов с галереей и фильтрами, AI-бот на типовые вопросы 24/7, расчёт ипотеки и передача готового лида риелтору.

Результат: +45% входящих заявок с визитки в соцсетях.
💰 30 000 ₽

Соберём аналог под вас: визитка эксперта с AI-квалификацией. Чем вы занимаетесь?`,
};

async function handleCaseScenario(chatId: number, caseId: string) {
  const text = CASE_SCRIPTS[caseId];
  if (!text) {
    await handleCases(chatId);
    return;
  }
  await sendMessage(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📝 Хочу такой же проект", callback_data: "leave_request" }],
        [{ text: "📋 Тарифы", callback_data: "tariffs" }],
        [{ text: "📊 Другие кейсы", callback_data: "cases" }],
        [BACK_MENU],
      ],
    },
  });
}

// --- Калькулятор ---

async function handleCalculatorEntry(chatId: number, firstName: string) {
  await supabase.from("bot_users").update({ goal: "ai_chat" }).eq("telegram_id", chatId);
  await sendMessage(
    chatId,
    `🧮 ${firstName}, посчитаем ваш проект.

<b>Напишите одной строкой вашу нишу и задачу.</b>
Например: «Стоматология, нужен бот для записи» или «Онлайн-школа, нужен кабинет ученика».

Сразу пришлю вилку бюджета и срок. Можно голосовым.

Ориентиры:
• Ботовизитка — от 10 000 ₽, 3–5 дней
• AI-бот — от 15 000 ₽, 5–10 дней
• Мини-приложение / сервис — от 30 000 ₽, от 14 дней
• Платформа с CRM и AI — от 100 000 ₽, 3–6 недель`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📋 Тарифы", callback_data: "tariffs" }],
          [{ text: "📊 Кейсы", callback_data: "cases" }],
          [BACK_MENU],
        ],
      },
    },
  );
}

// --- Быстрый контакт ---

async function handleQuickContact(chatId: number, firstName: string) {
  await supabase.from("bot_users").update({ goal: "ai_chat" }).eq("telegram_id", chatId);
  await sendMessage(
    chatId,
    `👋 ${firstName}, на связи.

Чтобы не тратить ваше время, ответьте тремя строками:
1️⃣ Что у вас за бизнес?
2️⃣ Что сейчас мешает / что хотите автоматизировать?
3️⃣ Когда нужен результат?

Отвечу вилкой по цене и предложу короткий звонок — 15 минут, без презентаций.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📞 Хочу звонок", callback_data: "leave_request" }],
          [{ text: "👨‍💻 Написать Петру", url: "https://t.me/petrfirstov" }],
          [{ text: "📋 Тарифы", callback_data: "tariffs" }],
          [BACK_MENU],
        ],
      },
    },
  );
}

// --- Партнёрка ---

async function handlePartnerScenario(chatId: number, firstName: string) {
  await sendMessage(
    chatId,
    `🤝 ${firstName}, рад видеть.

<b>Как работает партнёрство:</b>
• Вы получаете личный промокод и ссылку
• Каждый пришедший по ней закрепляется за вами навсегда
• Вы получаете 10–20% с каждого оплаченного проекта
• Средний проект — 30 000–200 000 ₽
• Клиент возвращается за доработками — вы получаете снова

<b>Амбассадорам дополнительно:</b> готовые материалы для контента, разборы кейсов и приоритетная поддержка.

Сейчас оформлю вашу ссылку 👇`,
  );
  await handleRegister(chatId, chatId, undefined);
}

// --- Манифест ---

async function handleManifesto(chatId: number) {
  await sendMessage(
    chatId,
    `📜 <b>Манифест созидателей</b>

1. Идея без воплощения — просто мысль. Ценность появляется в момент, когда продукт работает.

2. Создавать важнее, чем заказывать. Заказ даёт продукт. Создание даёт навык, который остаётся с вами.

3. AI — напарник, а не замена. Он ускоряет руки, но решение и вкус — ваши.

4. Лучше рабочий прототип за неделю, чем идеальный план за полгода.

5. Мы делимся находками: то, что один раз собрал и проверил один — экономит месяцы всем.

6. Мы создаём то, чем сами пользуемся. Никакой абстрактной учёбы.

7. Начать можно с любой точки: без диплома, без команды, без бюджета — с одной задачи, которая болит.

8. Ошибка — это данные, а не приговор. Сломалось — значит, поняли систему глубже.

9. Мы строим свой цифровой капитал: базы знаний, агенты и Skills остаются с вами.

10. Скорость важнее идеальности, но не важнее честности перед клиентом.

11. Сильные растут вместе: клуб — это среда, где чужой результат ускоряет ваш.

Если это про вас — вам к нам 👇`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛠 Войти в клуб", callback_data: "tariffs" }],
          [{ text: "🤖 Разобрать мою идею с AI", callback_data: "try_ai" }],
          [{ text: "📊 Кейсы", callback_data: "cases" }],
          [BACK_MENU],
        ],
      },
    },
  );
}

// --- Вход в клуб созидателей ---

async function handleClubEntry(chatId: number, firstName: string) {
  await sendMessage(
    chatId,
    `🛠 ${firstName}, добро пожаловать в «Созидатели 2.0».

Это клуб, где предприниматели собирают свои продукты с AI сами — и делятся находками.

<b>Три уровня участия:</b>
1️⃣ <b>База</b> — 1 000 ₽/мес: закрытый чат + библиотека готовых решений
2️⃣ <b>AI-Агент</b> — 5 000 ₽ разово: всё из «Базы» + личный AI-агент под вас (🔥 хит)
3️⃣ <b>AI-Партнёр</b> — 10 000 ₽/мес: всё выше + поток реальных заказов клуба

Первый прототип — уже на первой неделе.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "1️⃣ База — 1 000 ₽/мес", callback_data: "tariff_base" }],
          [{ text: "2️⃣ AI-агент — 5 000 ₽", callback_data: "tariff_agent" }],
          [{ text: "3️⃣ AI-партнёр — 10 000 ₽/мес", callback_data: "tariff_partner" }],
          [{ text: "📜 Манифест", callback_data: "manifesto" }],
          [{ text: "🤖 Разобрать мою идею с AI", callback_data: "try_ai" }],
          [BACK_MENU],
        ],
      },
    },
  );
}

// --- Приветствие + 3 пути ---

const ENTRY_INTRO: Record<string, string> = {
  hero: "Вы пришли с главного экрана — давайте попробуем вместе.",
  recognize: "Вы узнали себя в блоке «Узнаёшь себя?». Значит, пора попробовать по-другому.",
  story: "Вы прочли мою историю. Расскажите, что хотите создать вы.",
  offer: "Проверим мой подход прямо на вашей идее.",
  process: "Пройдём шаг 1 прямо сейчас: опишите идею одной фразой.",
  diff: "Главное отличие — вы учитесь создавать сами, а не просто получаете продукт.",
  build: "Подберём, что именно вам стоит создать первым.",
  header: "Вы зашли из шапки сайта — покажу главное.",
  start: "Начнём с того, что вы давно хотите создать.",
};

async function handleThreePaths(chatId: number, firstName: string, block?: string) {
  const intro = block && ENTRY_INTRO[block] ? `${ENTRY_INTRO[block]}\n\n` : "";
  await sendMessage(
    chatId,
    `Привет, ${firstName} 👋

${intro}Я — Пётр Фирстов. Создаю цифровые продукты с AI и учу создавать самому.

<b>Выберите, что вам ближе:</b>

🛠 <b>Клуб «Созидатели 2.0»</b> — создавать самому: от 1 000 ₽/мес
🧮 <b>Проект под ключ</b> — посчитаем бюджет и срок
🤝 <b>Партнёрство</b> — приводить клиентов и получать 10–20% с оплат

Можно просто написать текстом или голосом — я отвечу.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛠 Хочу создавать сам", callback_data: "tariffs" }],
          [{ text: "🧮 Рассчитать проект под ключ", callback_data: "calculator" }],
          [{ text: "🤝 Партнёрство", callback_data: "register" }],
          [{ text: "📊 Кейсы", callback_data: "cases" }],
          [{ text: "📜 Манифест", callback_data: "manifesto" }],
        ],
      },
    },
  );
}

// --- Роутер сценариев с сайта ---

async function handleScenarioEntry(chatId: number, firstName: string, param: string): Promise<boolean> {
  const p = param.toLowerCase();

  const remember = async (temp: FunnelTemp, block: string) => {
    await trackAction(chatId, "funnel_entry", { temp, block, param: p });
    await supabase
      .from("bot_users")
      .update({ source: p, funnel_temp: temp, entry_block: block })
      .eq("telegram_id", chatId);
  };

  // Тарифы клуба
  if (p === "tariff_base" || p === "tariff_agent" || p === "tariff_partner") {
    const key = p.replace("tariff_", "");
    await remember("club", `tariff_${key}`);
    await handleTariff(chatId, key);
    return true;
  }
  if (p === "ask_tariffs" || p === "tariffs" || p === "nav_tariffs") {
    await remember("club", "tariffs");
    await handleTariffsAll(chatId);
    return true;
  }

  // Кейсы (свой ответ под каждый)
  if (p.startsWith("hot_case_")) {
    const caseId = p.replace("hot_case_", "");
    await remember("hot", `case_${caseId}`);
    await handleCaseScenario(chatId, caseId);
    return true;
  }
  if (p === "hot_cases" || p === "cases") {
    await remember(p === "hot_cases" ? "hot" : "warm", "cases");
    await handleCases(chatId);
    return true;
  }

  // Калькулятор
  if (p === "hot_calculator" || p.startsWith("calc_")) {
    await remember("hot", "calculator");
    await handleCalculatorEntry(chatId, firstName);
    return true;
  }

  // Быстрый контакт
  if (p === "hot_contact") {
    await remember("hot", "contact");
    await handleQuickContact(chatId, firstName);
    return true;
  }

  // Партнёрство / амбассадорство
  if (p === "partner" || p === "partner_ambassador") {
    await remember("partner", "ambassador");
    await handlePartnerScenario(chatId, firstName);
    return true;
  }

  // Манифест
  if (p === "manifesto" || p === "manifesto_popup") {
    await remember("cold", "manifesto");
    await handleManifesto(chatId);
    return true;
  }

  // Клуб созидателей
  if (p === "club_creators" || p === "creators") {
    await remember("club", "creators");
    await handleClubEntry(chatId, firstName);
    return true;
  }

  // Общие входы с сайта: warm_* / cold_* / nav_header
  if (p === "nav_header" || p.startsWith("warm_") || p.startsWith("cold_")) {
    const block = p === "nav_header" ? "header" : p.replace(/^(warm|cold)_/, "") || "start";
    await remember(p.startsWith("cold_") ? "cold" : "warm", block);
    await handleThreePaths(chatId, firstName, block);
    return true;
  }

  return false;
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

  const statusMeta: Record<string, { emoji: string; label: string }> = {
    new: { emoji: "🆕", label: "Принята" },
    in_progress: { emoji: "⚙️", label: "В работе" },
    review: { emoji: "👀", label: "На проверке" },
    done: { emoji: "✅", label: "Готово" },
  };
  const order = ["in_progress", "review", "new", "done"];
  const groups: Record<string, any[]> = {};
  for (const t of tasks as any[]) {
    (groups[t.status] ||= []).push(t);
  }

  const blocks: string[] = [];
  for (const status of order) {
    const arr = groups[status];
    if (!arr?.length) continue;
    const meta = statusMeta[status] || { emoji: "•", label: status };
    const lines = arr
      .map((t: any) => {
        const d = new Date(t.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
        const pr = t.priority === "high" ? " 🔥" : t.priority === "low" ? " 🌱" : "";
        return `  • ${escapeHtml(t.title)}${pr} <i>(${d})</i>`;
      })
      .join("\n");
    blocks.push(`${meta.emoji} <b>${meta.label}</b> (${arr.length})\n${lines}`);
  }

  const legend = `\n\n<i>🆕 принята · ⚙️ в работе · 👀 на проверке · ✅ готово · 🔥 высокий приоритет</i>`;

  await sendMessage(chatId, `📋 <b>Ваши задачи — ${escapeHtml(project.name)}</b>\n\n${blocks.join("\n\n")}${legend}`, {
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

async function handleHelp(chatId: number, telegramId: number) {
  const project = await getClientProject(telegramId);
  if (project) {
    const canEdit = (project as any)._member_role !== "viewer";
    const text = `❓ <b>Подсказка по работе с проектом «${escapeHtml(project.name)}»</b>

<b>Что вы можете делать прямо здесь:</b>

📊 <b>Мой проект</b> — прогресс, последние обновления, границы MVP.
${canEdit ? `✏️ <b>Отправить правку</b> — опишите текстом или голосом. AI разберёт → покажет «правильно ли понял?» → вы подтверждаете → задача уходит в работу.\n` : ""}📋 <b>Мои задачи</b> — статусы: 🆕 принята · ⚙️ в работе · 👀 на проверке · ✅ готово.
🚀 <b>Идеи улучшений</b> — AI подскажет, что ещё добавить.

💬 Можно просто писать в чат — AI-ассистент ответит.
🎙 Голосовые сообщения тоже понимаю.
🔔 О готовых правках и ежедневной сводке узнаете автоматически.

<b>Команды:</b>
/start — главное меню
/project — кабинет проекта
/help — эта подсказка`;

    await sendMessage(chatId, text, { reply_markup: clientMenuKeyboard() });
    return;
  }

  await sendMessage(
    chatId,
    `❓ <b>Подсказка</b>

Я — бот Петра Фирстова. Создавай свои проекты с AI.

🛠 <b>Создавать самому</b> — AI-наставник, шаблоны, сообщество «Созидатели 2.0»
🤝 <b>Обсудить проект</b> — готовый продукт под ключ (бот, CRM, AI-ассистент, MVP)
🤖 <b>Попробовать AI</b> — напиши в чат, AI ответит
🔍 <b>Кейсы и цены</b> — реальные работы и стоимость
📝 <b>Заявка</b> — оставить заявку на проект

🎙 Голосовые сообщения тоже понимаю.

<b>Команды:</b>
/start — главное меню
/project — кабинет клиента (если у вас есть проект)
/help — эта подсказка`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛠 Хочу создавать сам", callback_data: "creators" }],
          [{ text: "🤝 Обсудить проект", callback_data: "discuss" }],
          [{ text: "🔙 Главное меню", callback_data: "start" }],
        ],
      },
    },
  );
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

      if (data === "start" || data === "main_menu") {
        await handleMainMenu(chatId);
      } else if (data === "creators") {
        await handleCreators(chatId);
      } else if (data === "discuss") {
        await handleDiscussProject(chatId);
      } else if (data === "what_to_build") {
        await handleWhatToBuild(chatId);
      } else if (data === "process") {
        await handleProcess(chatId);
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
      } else if (data === "tariffs") {
        await handleTariffsAll(chatId);
      } else if (data.startsWith("tariff_")) {
        await handleTariff(chatId, data.replace("tariff_", ""));
      } else if (data === "manifesto") {
        await handleManifesto(chatId);
      } else if (data === "quick_contact") {
        await handleQuickContact(chatId, firstName);
      } else if (data === "calculator") {
        await handleCalculatorEntry(chatId, firstName);
      } else if (data.startsWith("case_")) {
        await handleCaseScenario(chatId, data.replace("case_", ""));
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
      } else if (text === "/help") {
        await trackAction(telegramId, "command:help");
        await handleHelp(chatId, telegramId);
      } else if (text === "/tariffs" || text === "/price") {
        await trackAction(telegramId, "command:tariffs");
        await handleTariffsAll(chatId);
      } else if (text === "/manifesto") {
        await trackAction(telegramId, "command:manifesto");
        await handleManifesto(chatId);
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
