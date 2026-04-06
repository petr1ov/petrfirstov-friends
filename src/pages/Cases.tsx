import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Smartphone, Server, Eye, ExternalLink } from "lucide-react";

type CaseItem = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  category: "ai_cards" | "apps" | "services";
  description: string;
  features: string[];
  result: string;
  link?: string;
};

const categoryLabels: Record<string, string> = {
  all: "Все",
  ai_cards: "AI-визитки",
  apps: "Приложения",
  services: "Сервисы",
};

const categoryColors: Record<string, string> = {
  ai_cards: "bg-purple-500/20 text-purple-300",
  apps: "bg-blue-500/20 text-blue-300",
  services: "bg-emerald-500/20 text-emerald-300",
};

const categoryIcons: Record<string, React.ElementType> = {
  ai_cards: CreditCard,
  apps: Smartphone,
  services: Server,
};

// Static cases data (mirrors mini app)
const allCases: CaseItem[] = [
  {
    id: "1", title: "ИИ-визитка для риелтора", subtitle: "Автоматизация продаж недвижимости",
    price: "15 000 ₽", category: "ai_cards",
    description: "Telegram-бот, который отвечает на вопросы клиентов о недвижимости, собирает заявки и квалифицирует лидов.",
    features: ["Автоматические ответы по объектам", "Сбор и квалификация заявок", "Каталог недвижимости в боте", "Уведомления о горячих лидах"],
    result: "Автоответы → сбор заявок → рост записей без переписки",
    link: "https://t.me/RieltorDemoBot",
  },
  {
    id: "2", title: "ИИ-визитка для эксперта по EQ", subtitle: "Привлечение клиентов на консультации",
    price: "10 000 ₽", category: "ai_cards",
    description: "Бот-визитка, который рассказывает об услугах эксперта и записывает на консультацию.",
    features: ["Презентация услуг и кейсов", "Ответы на типовые вопросы", "Онлайн-запись на консультацию", "Прогрев через контент"],
    result: "Клиенты узнают → доверяют → записываются без участия эксперта",
  },
  {
    id: "3", title: "Город+", subtitle: "Агрегатор мероприятий",
    price: "80 000 ₽", category: "apps",
    description: "Платформа для поиска и продвижения мероприятий в городе.",
    features: ["Telegram-бот для поиска событий", "Сайт с каталогом", "Админ-панель для организаторов", "Аналитика и статистика"],
    result: "Люди находят события → организаторы получают клиентов",
  },
  {
    id: "4", title: "Мини-приложение для бизнеса", subtitle: "Полноценный сервис в Telegram",
    price: "от 30 000 ₽", category: "apps",
    description: "Кастомное мини-приложение внутри Telegram с каталогом и оплатой.",
    features: ["Каталог товаров / услуг", "Интеграция с оплатой", "Личный кабинет клиента", "Push-уведомления"],
    result: "Клиент покупает прямо в Telegram",
  },
  {
    id: "5", title: "AI-ассистент с ЛК", subtitle: "Цифровой сотрудник 24/7",
    price: "120 000 ₽", category: "services",
    description: "Интеллектуальный ассистент с личным кабинетом и автоматической воронкой.",
    features: ["ИИ-ассистент с ЛК", "Геймификация", "Ответы 24/7", "Доведение до заявки"],
    result: "Отвечает 24/7 → ведёт диалог → доводит до заявки",
  },
  {
    id: "6", title: "Голосовой бот", subtitle: "Автоматизация колл-центра",
    price: "от 60 000 ₽", category: "services",
    description: "Голосовой ИИ-бот для приёма звонков и записи клиентов.",
    features: ["Распознавание речи", "Ответы по сценарию", "Запись звонков", "Интеграция с CRM"],
    result: "Звонки обрабатываются 24/7 → ни один клиент не потерян",
  },
];

const Cases = () => {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<CaseItem | null>(null);

  const filtered = filter === "all" ? allCases : allCases.filter(c => c.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Кейсы</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <span>{categoryLabels[filter]}</span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((c) => {
          const Icon = categoryIcons[c.category];
          return (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelected(c)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={categoryColors[c.category]}>{categoryLabels[c.category]}</Badge>
                  <span className="text-sm font-bold text-primary">{c.price}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.subtitle} · <span className="font-semibold">{selected.price}</span>
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Что входит</p>
                {selected.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-accent">✨ {selected.result}</p>
              </div>
              <Badge className={categoryColors[selected.category]}>{categoryLabels[selected.category]}</Badge>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;
