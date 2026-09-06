import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Bot, 
  CreditCard, 
  Megaphone, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Send,
  Kanban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CASE_STUDIES } from '../data/casesData';

interface Lead {
  id: string;
  name: string;
  telegram: string;
  source: string;
  ref_code: string;
  status: 'new' | 'in_progress' | 'client' | 'completed';
  date: string;
  amount: string;
  projectNiche: string;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Виктор Садыков',
    telegram: '@vsadykov',
    source: 'Telegram Bot (Mini App)',
    ref_code: 'ref_firstov_vip',
    status: 'client',
    date: 'Сегодня, 11:20',
    amount: '200 000 ₽',
    projectNiche: 'Клуб предпринимателей «ПЕРВЫЕ»'
  },
  {
    id: 'lead-2',
    name: 'Эльвира Bar David',
    telegram: '@elvirameditation',
    source: 'Instagram Bot Funnel',
    ref_code: 'ambassador_olga',
    status: 'client',
    date: 'Вчера, 18:45',
    amount: '200 000 ₽',
    projectNiche: 'AI-платформа аудио-медитаций'
  },
  {
    id: 'lead-3',
    name: 'Артем Покровский',
    telegram: '@pokrovsky_legal',
    source: 'Квиз-калькулятор MiniApp',
    ref_code: 'miniapp_case_calc',
    status: 'in_progress',
    date: 'Вчера, 14:10',
    amount: '120 000 ₽',
    projectNiche: 'AI-ассистент юридической компании'
  },
  {
    id: 'lead-4',
    name: 'Мария Селезнева',
    telegram: '@marias_beauty',
    source: 'Прямой контакт @PetrFirstovBot',
    ref_code: 'organic',
    status: 'new',
    date: '04.09.2025, 09:30',
    amount: '45 000 ₽',
    projectNiche: 'Запись в бьюти-салон + AI-бот'
  },
  {
    id: 'lead-5',
    name: 'Игорь Денисов',
    telegram: '@idenisov_dev',
    source: 'Реферальная ссылка партнера',
    ref_code: 'ref_partner_pavel',
    status: 'new',
    date: '03.09.2025, 21:15',
    amount: '80 000 ₽',
    projectNiche: 'CRM для агентства недвижимости'
  }
];

export const AdminCrmView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'broadcasts' | 'analytics' | 'cases'>('leads');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAiPersonalizing, setIsAiPersonalizing] = useState(false);
  const [generatedAiPitch, setGeneratedAiPitch] = useState<string>('');

  const filteredLeads = leads.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.telegram.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.projectNiche.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleGeneratePersonalizedAiPitch = (lead: Lead) => {
    setSelectedLead(lead);
    setIsAiPersonalizing(true);
    setGeneratedAiPitch('');
    setTimeout(() => {
      setGeneratedAiPitch(
        `Привет, ${lead.name.split(' ')[0]}! Увидел твой интерес к разработке "${lead.projectNiche}". ` +
        `У нас уже есть готовая проверенная архитектура на базе Telegram WebApp и Supabase RLS с AI-ассистентом. ` +
        `Можем за 7-10 дней развернуть рабочий MVP, интегрировать в @PetrFirstovBot и запустить тестовый трафик. ` +
        `Удобно созвониться на 15 минут сегодня во второй половине дня?`
      );
      setIsAiPersonalizing(false);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Интеграция с базой petrfirstov-friends
            </span>
            <span className="text-xs text-slate-400">• Supabase Live Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Админ-панель & CRM Лидов
          </h1>
          <p className="text-sm text-slate-500">
            Управление лидами, реферальной программой, кейсами и рассылками через Telegram-бота
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'leads' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Лиды & Клиенты ({leads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('broadcasts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'broadcasts' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-4 h-4 text-purple-600" />
            <span>AI Рассылки</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Аналитика</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cases' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Кейсы ({CASE_STUDIES.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Всего Лидов</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">48</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">+12 за эту неделю</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Сумма в пайплайне</span>
            <CreditCard className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">645 000 ₽</p>
          <p className="text-xs text-slate-500 mt-1">Средний чек 129 000 ₽</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Конверсия в бота</span>
            <Bot className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">41.8%</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">+4.2% после редизайна</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Партнеры</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">14 чел.</p>
          <p className="text-xs text-slate-500 mt-1">Выплачено: 85 000 ₽</p>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск по имени, @username или проекту..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Статус:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-sky-500"
              >
                <option value="all">Все статусы</option>
                <option value="new">Новые</option>
                <option value="in_progress">В работе</option>
                <option value="client">Клиенты</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Имя & Проект</th>
                    <th className="py-3.5 px-4 font-semibold">Telegram</th>
                    <th className="py-3.5 px-4 font-semibold">Источник / Ref</th>
                    <th className="py-3.5 px-4 font-semibold">Бюджет</th>
                    <th className="py-3.5 px-4 font-semibold">Статус</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.projectNiche}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={`https://t.me/${lead.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium font-mono text-xs"
                        >
                          {lead.telegram}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-slate-700">{lead.source}</div>
                        <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                          {lead.ref_code}
                        </code>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {lead.amount}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value as Lead['status'])}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                            lead.status === 'client'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : lead.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          <option value="new">Новый</option>
                          <option value="in_progress">В работе</option>
                          <option value="client">Клиент (Оплачено)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleGeneratePersonalizedAiPitch(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:opacity-90 shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Оффер</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Pitch Modal / Inspector */}
          {selectedLead && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      Персонализированный AI-оффер для {selectedLead.name}
                    </h3>
                    <p className="text-xs text-indigo-300/80">
                      Сгенерировано под нишу «{selectedLead.projectNiche}» для отправки в Telegram
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/10"
                >
                  Закрыть
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-sans text-sm leading-relaxed text-slate-200">
                {isAiPersonalizing ? (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs py-3">
                    <span className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                    Генерация точечного коммерческого предложения по методологии Firstov.AI...
                  </div>
                ) : (
                  <p>{generatedAiPitch}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-indigo-300">
                  Готово к отправке в <span className="font-mono text-cyan-400">{selectedLead.telegram}</span>
                </span>
                <a
                  href={`https://t.me/${selectedLead.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Открыть чат и отправить</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Broadcasts Tab */}
      {activeTab === 'broadcasts' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Сегментированные рассылки через Telegram Bot
              </h2>
              <p className="text-xs text-slate-500">
                Отправка целевых уведомлений и офферов пользователям бота @PetrFirstovBot
              </p>
            </div>
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-purple-500/20 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              <span>Создать рассылку</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-700">
                <span>Сегмент: Смотрели кейсы</span>
                <span className="bg-purple-100 px-2 py-0.5 rounded-full">34 получателя</span>
              </div>
              <p className="text-xs text-slate-600">
                Оффер: «Свежий кейс по клубу "ПЕРВЫЕ" + расчет стоимости вашего проекта за 5 минут».
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Отправлено вчера в 19:00 • 78% открытий</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-700">
                <span>Сегмент: Пользователи AI-демо</span>
                <span className="bg-sky-100 px-2 py-0.5 rounded-full">52 получателя</span>
              </div>
              <p className="text-xs text-slate-600">
                Оффер: «Как мы обучаем персонального AI-ассистента на базе знаний вашей компании».
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Запланировано на завтра, 12:00</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Сегмент: Партнеры & Амбассадоры</span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded-full">14 получателей</span>
              </div>
              <p className="text-xs text-slate-600">
                Отчет: «Начисление 10-20% партнерских вознаграждений по итогам месяца».
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Отправлено 01.09.2025</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CASE_STUDIES.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {c.category.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-sky-600">{c.price}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.subtitle}</p>
                <div className="text-xs font-medium text-slate-700">Клиент: {c.client}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                {c.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Статистика конверсий и трафика</h2>
            <span className="text-xs text-slate-400">Синхронизировано с @PetrFirstovBot</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Воронка переходов</span>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>Визиты Mini App</span>
                    <span>1,420</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                    <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>Открытие калькулятора</span>
                    <span>594 (41.8%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '41.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>Отправка заявки в бота</span>
                    <span>186 (13.1%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '13.1%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Популярные запросы калькулятора</span>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Telegram Mini App под ключ</span>
                  <span className="font-semibold">44%</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>AI-ассистент & автоответы</span>
                  <span className="font-semibold">31%</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Интеграция CRM & платежей</span>
                  <span className="font-semibold">25%</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Топовые источники</span>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Рефералы партнеров</span>
                  <span className="font-semibold text-emerald-600">48%</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Telegram-каналы автора</span>
                  <span className="font-semibold">34%</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Прямые заходы на сайт</span>
                  <span className="font-semibold">18%</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
