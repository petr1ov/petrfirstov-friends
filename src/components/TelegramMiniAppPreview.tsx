import React, { useState } from 'react';
import { 
  X, 
  MoreVertical, 
  Sparkles, 
  Send, 
  Calculator, 
  Gift, 
  Brain, 
  ExternalLink,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Star,
  Zap,
  PhoneCall,
  Layout
} from 'lucide-react';
import { TelegramThemeMode } from '../types';
import { CASE_STUDIES } from '../data/casesData';
import { OriginalSiteRedesign } from './OriginalSiteRedesign';

export const TelegramMiniAppPreview: React.FC = () => {
  const [themeMode, setThemeMode] = useState<TelegramThemeMode>('telegram-dark');
  const [activeTab, setActiveTab] = useState<'home' | 'full-site' | 'cases' | 'calc' | 'ai-chat'>('full-site');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculator State
  const [calcScope, setCalcScope] = useState<'bot' | 'miniapp' | 'ai_system'>('miniapp');
  const [calcAi, setCalcAi] = useState<'none' | 'smart' | 'agent'>('smart');
  const [calcCrm, setCalcCrm] = useState<boolean>(true);

  // AI Chat Demo state
  const [messages, setMessages] = useState<Array<{ role: 'bot' | 'user'; text: string }>>([
    {
      role: 'bot',
      text: 'Привет! Я виртуальный AI-партнёр Firstov.AI. Могу рассчитать смету вашего Telegram Mini App, подсказать архитектуру или подключить Петра Фирстова. Что планируете создать?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Base calculation logic
  const calculatePrice = () => {
    let base = 30000;
    if (calcScope === 'bot') base = 15000;
    if (calcScope === 'ai_system') base = 80000;

    let aiCost = 0;
    if (calcAi === 'smart') aiCost = 25000;
    if (calcAi === 'agent') aiCost = 60000;

    const crmCost = calcCrm ? 15000 : 0;
    return (base + aiCost + crmCost).toLocaleString('ru-RU');
  };

  const handleSendAiMessage = (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isBotThinking) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setChatInput('');
    setIsBotThinking(true);

    setTimeout(() => {
      let botResponse = 'Отличная идея! Для таких задач идеально подходит связка Telegram Mini App + Supabase с локальной базой данных и AI-ассистентом. Срок запуска MVP — всего 10-14 дней. Хотите посмотреть аналогичный кейс?';
      
      if (textToSend.toLowerCase().includes('сколько') || textToSend.toLowerCase().includes('цена') || textToSend.toLowerCase().includes('стоимость')) {
        botResponse = 'Стоимость типового Telegram Mini App начинается от 30 000 ₽. С AI-ассистентом и CRM — от 70 000 до 150 000 ₽. Фиксируем цену в договоре до начала разработки!';
      } else if (textToSend.toLowerCase().includes('кейс') || textToSend.toLowerCase().includes('пример')) {
        botResponse = 'Посмотрите наш кейс «ПЕРВЫЕ» (клуб предпринимателей с AI-нетворкингом) или платформу медитаций EBD Mind. Они уже приносят клиентам регулярные заявки!';
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      setIsBotThinking(false);
    }, 700);
  };

  // Theme palettes
  const themeStyles = {
    'telegram-dark': {
      bg: 'bg-[#121622]',
      cardBg: 'bg-[#1c2233]',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      headerBg: 'bg-[#181e2e] border-[#252f46]',
      accent: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white',
      accentText: 'text-cyan-400',
      border: 'border-[#252f46]',
      badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    },
    'midnight': {
      bg: 'bg-[#0a0d14]',
      cardBg: 'bg-[#111624]',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      headerBg: 'bg-[#0f1422] border-[#1e263d]',
      accent: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      accentText: 'text-pink-400',
      border: 'border-[#1e263d]',
      badge: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
    },
    'emerald': {
      bg: 'bg-[#0b1612]',
      cardBg: 'bg-[#11241e]',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      headerBg: 'bg-[#0d1e18] border-[#1b3a30]',
      accent: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      accentText: 'text-emerald-400',
      border: 'border-[#1b3a30]',
      badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    'telegram-light': {
      bg: 'bg-[#f4f6f8]',
      cardBg: 'bg-white',
      text: 'text-slate-900',
      textMuted: 'text-slate-500',
      headerBg: 'bg-white border-slate-200',
      accent: 'bg-sky-600 text-white',
      accentText: 'text-sky-600',
      border: 'border-slate-200',
      badge: 'bg-sky-50 text-sky-700 border border-sky-200',
    },
  };

  const t = themeStyles[themeMode];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-2">
      {/* Phone Mockup Frame */}
      <div className="relative w-[370px] sm:w-[390px] h-[750px] bg-slate-950 rounded-[48px] p-3 shadow-2xl shadow-indigo-950/40 ring-1 ring-white/20 flex flex-col shrink-0 overflow-hidden">
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
          <div className="w-2 h-2 rounded-full bg-blue-950/40" />
        </div>

        {/* Telegram App Header Bar */}
        <div className={`pt-7 pb-2.5 px-4 flex items-center justify-between border-b ${t.headerBg} select-none z-30 transition-colors`}>
          <button 
            type="button" 
            onClick={() => showToast('Telegram.WebApp.close()')}
            className={`text-xs font-semibold ${t.accentText} hover:opacity-80 transition-opacity`}
          >
            Закрыть
          </button>
          
          <div className="text-center">
            <div className={`text-xs font-bold ${t.text} truncate max-w-[170px]`}>
              Firstov.AI | Mini App
            </div>
            <div className={`text-[10px] ${t.textMuted}`}>
              @PetrFirstovBot
            </div>
          </div>

          <button 
            type="button" 
            onClick={() => showToast('Telegram меню бота')}
            className={`p-1 rounded-md ${t.textMuted} hover:${t.text}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Inner Scrollable Mini App Content */}
        <div className={`flex-1 overflow-y-auto ${t.bg} px-3.5 py-3.5 space-y-4 transition-colors relative`}>
          {/* Toast Notification */}
          {toastMessage && (
            <div className="sticky top-2 z-50 bg-slate-900/95 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-white/10 flex items-center justify-between animate-in fade-in">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mini App Nav */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-black/20 border border-white/5 text-[11px] font-medium gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('full-site')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'full-site' ? `${t.accent} font-semibold shadow-xs` : `${t.textMuted}`
              }`}
            >
              Сайт (17 блоков)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'home' ? `${t.accent} font-semibold shadow-xs` : `${t.textMuted}`
              }`}
            >
              Компактно
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cases')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'cases' ? `${t.accent} font-semibold shadow-xs` : `${t.textMuted}`
              }`}
            >
              Кейсы
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calc')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'calc' ? `${t.accent} font-semibold shadow-xs` : `${t.textMuted}`
              }`}
            >
              Расчет
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai-chat')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                activeTab === 'ai-chat' ? `${t.accent} font-semibold shadow-xs` : `${t.textMuted}`
              }`}
            >
              AI Демо
            </button>
          </div>

          {/* TAB 0: FULL ORIGINAL REDESIGNED SITE */}
          {activeTab === 'full-site' && (
            <div className="rounded-2xl overflow-hidden border border-white/10 -mx-1">
              <OriginalSiteRedesign isPhoneFrame />
            </div>
          )}

          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              {/* Hero Banner */}
              <div className={`p-4 rounded-3xl ${t.cardBg} border ${t.border} shadow-sm relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badge}`}>
                    Firstov.AI Ecosystem
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">● Online</span>
                </div>

                <h3 className={`text-base font-bold font-display ${t.text} leading-snug mb-1.5`}>
                  Создаём сервисы, где AI берёт рутину, а вы — результат
                </h3>

                <p className={`text-xs ${t.textMuted} leading-relaxed mb-3.5`}>
                  Telegram Mini Apps, интеллектуальные боты, CRM и автоматизация бизнеса под ключ.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('calc')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold ${t.accent} flex items-center justify-center gap-1.5 shadow-sm`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Рассчитать смету</span>
                  </button>

                  <a
                    href="https://t.me/PetrFirstovBot?start=hot_contact"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10"
                    title="Написать в бота"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Author Card with photo */}
              <div className={`p-3.5 rounded-2xl ${t.cardBg} border ${t.border} flex items-center gap-3`}>
                <img
                  src="/petr-firstov.jpg"
                  alt="Петр Фирстов"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-cyan-500/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${t.text}`}>Петр Фирстов</h4>
                    <span className="text-[10px] text-cyan-400 font-medium">@petr1ov</span>
                  </div>
                  <p className={`text-[11px] ${t.textMuted} truncate mt-0.5`}>
                    Архитектор Telegram Mini Apps & AI
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    «AI — не замена человеку, а мощный партнер»
                  </p>
                </div>
              </div>

              {/* Quick Products Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className={`p-3 rounded-2xl ${t.cardBg} border ${t.border}`}>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-cyan-400 mb-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h5 className={`text-xs font-bold ${t.text}`}>Mini Apps</h5>
                  <p className={`text-[10px] ${t.textMuted} mt-0.5`}>Полноценный web-сервис прямо внутри TG</p>
                  <span className="text-xs font-bold text-cyan-400 mt-2 block">от 30 000 ₽</span>
                </div>

                <div className={`p-3 rounded-2xl ${t.cardBg} border ${t.border}`}>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h5 className={`text-xs font-bold ${t.text}`}>AI-агенты</h5>
                  <p className={`text-[10px] ${t.textMuted} mt-0.5`}>Консультации, продажи и автоответы 24/7</p>
                  <span className="text-xs font-bold text-purple-400 mt-2 block">от 15 000 ₽</span>
                </div>
              </div>

              {/* Partner Referral Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Gift className="w-3.5 h-3.5" />
                    <span>Партнёрская программа</span>
                  </div>
                  <p className={`text-[11px] ${t.textMuted} mt-0.5`}>
                    10–20% с каждого приведённого проекта
                  </p>
                </div>
                <a
                  href="https://t.me/PetrFirstovBot?start=partner"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] shrink-0"
                >
                  Стать партнёром
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: CASES */}
          {activeTab === 'cases' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className={t.textMuted}>Реализованные проекты</span>
                <span className="text-[11px] text-cyan-400">С реальными клиентами</span>
              </div>

              {CASE_STUDIES.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl ${t.cardBg} border ${t.border} space-y-2.5 shadow-2xs`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-cyan-400">
                        {c.category}
                      </span>
                      <h4 className={`text-xs font-bold ${t.text} mt-1.5 leading-snug`}>
                        {c.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 shrink-0 font-mono">
                      {c.price}
                    </span>
                  </div>

                  <p className={`text-[11px] ${t.textMuted} leading-relaxed`}>
                    {c.subtitle}
                  </p>

                  <div className="text-[10px] text-slate-400 bg-black/20 p-2 rounded-xl">
                    <strong className="text-slate-300">Клиент:</strong> {c.client}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('calc');
                        showToast(`Выбран расчет по аналогу: ${c.title.slice(0, 20)}...`);
                      }}
                      className="text-[11px] font-medium text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Хочу такой же <ArrowRight className="w-3 h-3" />
                    </button>

                    <a
                      href="https://t.me/PetrFirstovBot?start=cases"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Обсудить в боте →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === 'calc' && (
            <div className="space-y-3.5">
              <div className={`p-3.5 rounded-2xl ${t.cardBg} border ${t.border} space-y-3`}>
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <h4 className={`text-xs font-bold ${t.text}`}>
                    Интерактивный расчет проекта
                  </h4>
                </div>
                <p className={`text-[11px] ${t.textMuted}`}>
                  Выберите конфигурацию вашего будущего решения
                </p>

                {/* Scope selector */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
                    1. Формат разработки
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'bot', label: 'Telegram Бот' },
                      { id: 'miniapp', label: 'Mini App' },
                      { id: 'ai_system', label: 'AI Сервис' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCalcScope(item.id as any)}
                        className={`p-2 rounded-xl text-[10px] font-semibold border transition-all ${
                          calcScope === item.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Model selector */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
                    2. AI-интеллект
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'none', label: 'Без AI' },
                      { id: 'smart', label: 'AI Ответы' },
                      { id: 'agent', label: 'AI Агент' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCalcAi(item.id as any)}
                        className={`p-2 rounded-xl text-[10px] font-semibold border transition-all ${
                          calcAi === item.id
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CRM Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[11px]">
                    <span className={`font-semibold ${t.text} block`}>CRM & База данных</span>
                    <span className={`text-[10px] ${t.textMuted}`}>Сбор лидов, аналитика и рассылки</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={calcCrm}
                    onChange={(e) => setCalcCrm(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </div>

                {/* Result Price Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/20 border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                    Ориентировочная стоимость:
                  </span>
                  <div className="text-xl font-extrabold font-mono text-white">
                    от {calculatePrice()} ₽
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Срок реализации MVP: 10–14 рабочих дней
                  </span>
                </div>

                <a
                  href={`https://t.me/PetrFirstovBot?start=calc_${calcScope}_${calcAi}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold ${t.accent} flex items-center justify-center gap-2 shadow-md`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить расчет Петру в бота</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: AI CHAT DEMO */}
          {activeTab === 'ai-chat' && (
            <div className="space-y-3 flex flex-col h-[510px]">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                <span className={`font-bold ${t.text} flex items-center gap-1.5`}>
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  AI-консультант Firstov.AI
                </span>
                <span className="text-[10px] text-emerald-400">● Live Demo</span>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                          : `${t.cardBg} ${t.text} border ${t.border} rounded-tl-none`
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isBotThinking && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    AI генерирует рекомендацию...
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                  'Сколько стоит Mini App?',
                  'Покажи кейс клуба ПЕРВЫЕ',
                  'Как подключить оплату?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendAiMessage(q)}
                    className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 hover:bg-white/10 shrink-0 whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <input
                  type="text"
                  placeholder="Задайте вопрос AI..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                  className="flex-1 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => handleSendAiMessage()}
                  disabled={!chatInput.trim() || isBotThinking}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Home Indicator */}
        <div className="py-2 flex justify-center z-20">
          <div className="w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Side Info & Customization Controls */}
      <div className="max-w-md space-y-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Эмуляция Telegram WebApp SDK
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 font-display">
            Интерактивный интерфейс бота @PetrFirstovBot
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            В превью полностью воссозданы компоненты репозитория <strong className="font-mono">petrfirstov-friends</strong>:
            витрина кейсов, умный калькулятор сметы, живой AI-чат и реферальная программа с прямым переходом в бота.
          </p>
        </div>

        {/* Theme Picker */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Цветовая тема Telegram клиента:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'telegram-dark', label: 'Telegram Dark', hint: 'Неоновый темный' },
              { id: 'midnight', label: 'Midnight Blue', hint: 'Фиолетовый кибер' },
              { id: 'emerald', label: 'Emerald Deep', hint: 'Изумрудная гамма' },
              { id: 'telegram-light', label: 'Telegram Light', hint: 'Светлый классический' },
            ].map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setThemeMode(theme.id as TelegramThemeMode)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  themeMode === theme.id
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-semibold shadow-2xs ring-1 ring-sky-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="text-xs">{theme.label}</div>
                <div className="text-[10px] text-slate-400">{theme.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bot Integration Highlights */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-900 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>Связка с Telegram-ботом</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Глубокие ссылки <code className="text-cyan-300 font-mono">botLink(temp, block)</code> для персонализированных воронок</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Интеграция с Edge-функцией <code className="text-cyan-300 font-mono">telegram-bot</code> и Supabase DB</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Автоматический трекинг лидов и UTM-меток прямо в CRM-панели</span>
            </li>
          </ul>

          <a
            href="https://t.me/PetrFirstovBot"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block w-full py-2.5 text-center text-xs font-bold rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-sm"
          >
            Открыть оригинального @PetrFirstovBot в Telegram →
          </a>
        </div>
      </div>
    </div>
  );
};
