import React, { useState } from 'react';
import { Github, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Code2, Layers, Palette, ShieldCheck, X } from 'lucide-react';
import { ProjectRepoInfo } from '../types';

interface RepoImporterProps {
  repoInfo: ProjectRepoInfo;
  onUpdateRepo: (url: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const RepoImporter: React.FC<RepoImporterProps> = ({
  repoInfo,
  onUpdateRepo,
  isOpen,
  onClose,
}) => {
  const [inputUrl, setInputUrl] = useState(repoInfo.url);
  const [activeTab, setActiveTab] = useState<'url' | 'guide'>('url');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onUpdateRepo(inputUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-sky-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">
                Подключение вашего проекта с GitHub
              </h3>
              <p className="text-xs text-slate-500">
                Редизайн сайта и оптимизация интеграции с Telegram-ботом
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Ссылка на репозиторий
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Как передать код
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'url' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  URL публичного репозитория GitHub
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://github.com/username/telegram-bot-site"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900 transition-all font-mono"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Укажите ссылку на репозиторий, и я смогу загрузить исходный код и полностью осовременить UI/UX.
                </p>
              </div>

              {/* Proposed improvements highlight */}
              <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Что я сделаю с вашим проектом:
                </div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Современная верстка:</strong> адаптивный интерфейс с аккуратной типографикой, плавными анимациями и чистой структурой блоков.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Нативная поддержка Telegram WebApp:</strong> авто-подстройка под тему пользователя (dark/light), интеграция MainButton, HapticFeedback и получение данных пользователя.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Двусторонний интерфейс:</strong> роскошный лендинг для браузера + компактный эргономичный интерфейс для Telegram Mini App.</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  <span>Применить репозиторий</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-600" />
                  Способы передать проект:
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-xs leading-relaxed">
                  <li>
                    <strong>Отправить ссылку в чат:</strong> Просто отправьте ссылку вида <code>https://github.com/...</code> мне в сообщении.
                  </li>
                  <li>
                    <strong>Вставить код компонентов:</strong> Вы можете вставить исходный HTML, CSS или JS/React код сайта прямо в диалог.
                  </li>
                  <li>
                    <strong>Загрузить файлы:</strong> Через проводник файлов или перетаскиванием файлов проекта в окно AI Studio.
                  </li>
                </ol>
              </div>

              <p className="text-xs text-slate-500">
                После передачи файлов я сохраню всю бизнес-логику подключения к боту, пересоберу дизайн на современных компонентах Tailwind и React, добавлю поддержку тем и проверю работоспособность.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Понятно
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
