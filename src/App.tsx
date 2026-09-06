/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PreviewMode, ProjectRepoInfo } from './types';
import { Navbar } from './components/Navbar';
import { TelegramMiniAppPreview } from './components/TelegramMiniAppPreview';
import { WebLandingView } from './components/WebLandingView';
import { BotIntegrationPanel } from './components/BotIntegrationPanel';
import { AdminCrmView } from './components/AdminCrmView';
import { RepoImporter } from './components/RepoImporter';
import { Smartphone, Monitor, Sparkles, Cpu } from 'lucide-react';

export default function App() {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('web-desktop');
  const [isRepoModalOpen, setIsRepoModalOpen] = useState<boolean>(false);
  const [repoInfo, setRepoInfo] = useState<ProjectRepoInfo>({
    url: 'https://github.com/petr1ov/petrfirstov-friends.git',
    owner: 'petr1ov',
    repo: 'petrfirstov-friends',
    isCustom: true,
    status: 'ready',
  });

  const handleUpdateRepo = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    setRepoInfo({
      url,
      owner: match ? match[1] : '',
      repo: match ? match[2].replace(/\.git$/, '') : 'project',
      isCustom: true,
      status: 'ready',
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col font-sans text-slate-100 antialiased selection:bg-purple-500/30 selection:text-white">
      {/* Clean Uncluttered Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {previewMode === 'web-desktop' && (
          <WebLandingView
            onOpenTelegramPreview={() => setPreviewMode('telegram-mobile')}
            onOpenRepoModal={() => setIsRepoModalOpen(true)}
          />
        )}

        {previewMode === 'telegram-mobile' && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Эмулятор Telegram Mini App
                </h2>
                <p className="text-xs text-slate-400">
                  Отображение сайта внутри мобильного клиента Telegram
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode('web-desktop')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
              >
                ← Вернуться на сайт
              </button>
            </div>
            <TelegramMiniAppPreview />
          </div>
        )}

        {previewMode === 'admin-crm' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">CRM и заявки</h2>
                <p className="text-xs text-slate-400">Управление лидами и воронкой бота</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode('web-desktop')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
              >
                ← Вернуться на сайт
              </button>
            </div>
            <AdminCrmView />
          </div>
        )}

        {previewMode === 'bot-settings' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Настройки Telegram Bot API</h2>
                <p className="text-xs text-slate-400">Конфигурация вебхуков и команд бота</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode('web-desktop')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
              >
                ← Вернуться на сайт
              </button>
            </div>
            <BotIntegrationPanel />
          </div>
        )}
      </main>

      {/* Discrete Bottom-Right Mode Switcher Pill */}
      <div className="fixed bottom-4 right-4 z-40 bg-slate-950/80 backdrop-blur-xl border border-white/15 p-1 rounded-full shadow-2xl flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => setPreviewMode('web-desktop')}
          title="Веб-сайт"
          className={`p-2 rounded-full transition-all ${
            previewMode === 'web-desktop'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('telegram-mobile')}
          title="Telegram Mini App эмулятор"
          className={`p-2 rounded-full transition-all ${
            previewMode === 'telegram-mobile'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('admin-crm')}
          title="CRM Лиды"
          className={`p-2 rounded-full transition-all ${
            previewMode === 'admin-crm'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode('bot-settings')}
          title="Бот & API"
          className={`p-2 rounded-full transition-all ${
            previewMode === 'bot-settings'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
        </button>
      </div>

      {/* Modal for GitHub Repo connection if needed */}
      <RepoImporter
        repoInfo={repoInfo}
        onUpdateRepo={handleUpdateRepo}
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
      />
    </div>
  );
}
