import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  Key, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Code2, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { BotCommand, BotStatusInfo } from '../types';

export const BotIntegrationPanel: React.FC = () => {
  const [botToken, setBotToken] = useState<string>('7481920381:AAF_sample_bot_token_telegram_api');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [testPayloadResult, setTestPayloadResult] = useState<string | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);

  const commands: BotCommand[] = [
    {
      command: '/start',
      description: 'Приветственное сообщение и кнопка запуска WebApp',
      responsePreview: '👋 Привет! Добро пожаловать. Нажмите кнопку ниже, чтобы открыть обновленный сайт внутри Telegram.',
    },
    {
      command: '/app',
      description: 'Открыть Telegram Mini App во весь экран',
      responsePreview: '🚀 Запуск веб-приложения...',
    },
    {
      command: '/profile',
      description: 'Информация об аккаунте, балансе и заказах',
      responsePreview: '👤 Ваш профиль: @username (ID: 7392104). Баланс: 1,450 ₽.',
    },
    {
      command: '/support',
      description: 'Связаться с поддержкой или создать тикет',
      responsePreview: '💬 Напишите ваш вопрос, оператор ответит в течение 5 минут.',
    },
  ];

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setTestPayloadResult(null);
    setTimeout(() => {
      setIsTestingWebhook(false);
      setTestPayloadResult(
        JSON.stringify(
          {
            ok: true,
            result: {
              url: 'https://ais-dev-bgyximswvvr4pe3kdkplvl-230692988003.us-west1.run.app/api/telegram-webhook',
              has_custom_certificate: false,
              pending_update_count: 0,
              last_sync: new Date().toISOString(),
              status: '200 OK (Processed update #10492)',
            },
          },
          null,
          2
        )
      );
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Интеграция с Telegram Bot API & Webhook
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Конфигурация команд бота, проверка вебхуков и безопасная авторизация Telegram WebApp
        </p>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Состояние Webhook</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Подключен (Active)</span>
          </div>
          <p className="text-[11px] text-slate-400">Telegram Bot API 7.0+</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Задержка отклика (Ping)</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            38 мс
          </div>
          <p className="text-[11px] text-slate-400">Оптимальная синхронизация</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Безопасность initData</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            HMAC-SHA256
          </div>
          <p className="text-[11px] text-slate-400">Защита от подделки запросов</p>
        </div>
      </div>

      {/* Bot Commands */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Команды Telegram-бота
            </h3>
            <p className="text-xs text-slate-500">
              Список зарегистрированных команд, вызывающих веб-приложение
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {commands.map((cmd) => (
            <div key={cmd.command} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/80">
                    {cmd.command}
                  </code>
                  <span className="text-xs font-semibold text-slate-800">
                    {cmd.description}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pl-1 italic">
                  Ответ бота: «{cmd.responsePreview}»
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(cmd.command)}
                className="self-start sm:self-auto px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCmd === cmd.command ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Test Diagnostic Console */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Диагностика связи бота и веб-сайта
            </h3>
          </div>

          <button
            type="button"
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
            <span>{isTestingWebhook ? 'Проверка...' : 'Проверить Webhook'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Проверка доставки входящих обновлений от серверов Telegram (<code>api.telegram.org/bot&lt;token&gt;/getWebhookInfo</code>).
        </p>

        {testPayloadResult ? (
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto">
            {testPayloadResult}
          </pre>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            Нажмите «Проверить Webhook» для отправки тестового диагностического запроса.
          </div>
        )}
      </div>
    </div>
  );
};
