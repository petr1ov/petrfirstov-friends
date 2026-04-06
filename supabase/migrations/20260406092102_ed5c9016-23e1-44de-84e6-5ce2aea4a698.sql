
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'ai_cards',
  description TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  result TEXT NOT NULL DEFAULT '',
  link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cases" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage cases" ON public.cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cases" ON public.cases FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed existing cases
INSERT INTO public.cases (title, subtitle, price, category, description, features, result, link, sort_order) VALUES
('ИИ-визитка для риелтора', 'Автоматизация продаж недвижимости', '15 000 ₽', 'ai_cards', 'Telegram-бот, который отвечает на вопросы клиентов о недвижимости, собирает заявки и квалифицирует лидов автоматически.', ARRAY['Автоматические ответы по объектам','Сбор и квалификация заявок','Каталог недвижимости в боте','Уведомления риелтору о горячих лидах'], 'Автоответы → сбор заявок → рост записей без переписки', 'https://t.me/RieltorDemoBot', 1),
('ИИ-визитка для эксперта по EQ', 'Привлечение клиентов на консультации', '10 000 ₽', 'ai_cards', 'Бот-визитка, который рассказывает об услугах эксперта, отвечает на частые вопросы и записывает на консультацию.', ARRAY['Презентация услуг и кейсов','Ответы на типовые вопросы','Онлайн-запись на консультацию','Прогрев через контент'], 'Клиенты узнают → доверяют → записываются без участия эксперта', 'https://t.me/EQExpertBot', 2),
('Город+', 'Агрегатор мероприятий', '80 000 ₽', 'apps', 'Полноценная платформа для поиска и продвижения мероприятий в городе. Telegram-бот + сайт + админ-панель.', ARRAY['Telegram-бот для поиска событий','Сайт с каталогом мероприятий','Админ-панель для организаторов','Система аналитики и статистики'], 'Люди находят события → организаторы получают клиентов', NULL, 3),
('Мини-приложение для бизнеса', 'Полноценный сервис в Telegram', 'от 30 000 ₽', 'apps', 'Кастомное мини-приложение внутри Telegram с каталогом, оплатой и личным кабинетом.', ARRAY['Каталог товаров / услуг','Интеграция с оплатой','Личный кабинет клиента','Push-уведомления через бота'], 'Клиент покупает прямо в Telegram без перехода на сайт', NULL, 4),
('AI-ассистент с ЛК', 'Цифровой сотрудник 24/7', '120 000 ₽', 'services', 'Интеллектуальный ассистент с личным кабинетом, геймификацией и автоматической воронкой продаж.', ARRAY['ИИ-ассистент с личным кабинетом','Геймификация для вовлечения','Ответы 24/7 на любые вопросы','Доведение до заявки автоматически'], 'Отвечает 24/7 → ведёт диалог → доводит до заявки', NULL, 5),
('Голосовой бот для обработки звонков', 'Автоматизация колл-центра', 'от 60 000 ₽', 'services', 'Голосовой ИИ-бот, который принимает звонки, отвечает на вопросы и записывает клиентов.', ARRAY['Распознавание речи в реальном времени','Ответы по сценарию и свободный диалог','Запись и транскрибация звонков','Интеграция с CRM'], 'Звонки обрабатываются 24/7 → ни один клиент не потерян', NULL, 6);
