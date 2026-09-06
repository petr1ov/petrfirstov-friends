export type PreviewMode = 'telegram-mobile' | 'web-desktop' | 'admin-crm' | 'bot-settings';

export type TelegramThemeMode = 'telegram-dark' | 'midnight' | 'emerald' | 'telegram-light';

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  price: string;
  budget: number;
  featured: boolean;
  tags: string[];
  client: string;
  deliverables?: string[];
  metrics?: string;
  stack?: string[];
}

export interface BotCommand {
  command: string;
  description: string;
  responsePreview: string;
}

export interface BotStatusInfo {
  name: string;
  username: string;
  isOnline: boolean;
  activeUsersCount: number;
  totalRequests: number;
  lastPingMs: number;
  webhookConfigured: boolean;
}

export interface ProjectRepoInfo {
  url: string;
  owner: string;
  repo: string;
  isCustom: boolean;
  status: 'idle' | 'analyzing' | 'ready' | 'error';
  errorMessage?: string;
}

