# @PetrFirstovBot

Telegram-бот партнёрской программы

Бот должен позволять пользователям:
• регистрироваться как партнёры
• получать персональную реферальную ссылку
• приводить клиентов
• отслеживать статистику
• получать информацию о вознаграждениях
Бот будет использоваться для лидогенерации для сайта:
https://petrfirstov.ru
1. Общая логика
Пользователь заходит в Telegram-бот.
Нажимает Стать партнёром.
Регистрируется.
Получает уникальную партнёрскую ссылку.
Делится ссылкой.
Если клиент приходит по ссылке — система фиксирует лид.
В боте отображается статистика.
2. Стартовый экран бота
После команды /start бот показывает:
Заголовок:
Партнёрская программа Петра Фирстова
Описание:
Зарабатывайте на рекомендациях разработки:
• Telegram-ботов
• сайтов
• AI-ассистентов
• MVP стартапов
Вознаграждение:
10–20% с каждого проекта.
Кнопки:
Стать партнёром
Как это работает
Материалы
Моя статистика
3. Регистрация партнёра
После нажатия Стать партнёром бот задаёт вопросы:
1️⃣ Имя
2️⃣ Telegram username
3️⃣ Как вы планируете приводить клиентов:
варианты кнопок:
• знакомые
• Telegram-канал
• агентство
• маркетинг / реклама
• другое
После регистрации:
создаётся partner_id
и реферальный код
пример:
ref_1045 
4. Персональная партнёрская ссылка
Бот отправляет:
Ваша партнёрская ссылка:
https://firstov.ai/?ref=ref_1045 
или
https://t.me/firstov_partner_bot?start=ref_1045 
Кнопки:
Скопировать ссылку
Открыть сайт
Отправить другу
5. Отслеживание лидов
Когда человек приходит на сайт по ссылке:
?ref=ref_1045 
система должна:
сохранить ref_code
записать визит
если пользователь оставил заявку — записать лид
6. Статистика партнёра
Раздел Моя статистика показывает:
Переходы по ссылке
Количество лидов
Количество клиентов
Общий доход
Пример:
Переходы: 42
Лиды: 7
Клиенты: 2
Доход: 20 000 ₽
7. Раздел "Материалы"
Бот должен выдавать готовые тексты для привлечения клиентов.
Кнопки:
Описание услуг
Кейсы
Текст для рекомендации
Ссылка на сайт
8. Кейсы (пример)
Telegram-бот показывает:
Кейс 1
Агрегатор мероприятий "Город+"
Что сделано:
Telegram-бот
сайт
админ-панель
система аналитики
Стоимость проекта:
≈ 80 000 ₽
Кейс 2
AI-наставник в Telegram
Что сделано:
ИИ-ассистент
личный кабинет
геймификация
Стоимость:
≈ 120 000 ₽
9. Админ-панель
Нужна простая админка.
Админ должен видеть:
список партнёров
реферальные ссылки
клики
лиды
клиентов
выплаты
10. Структура базы данных
Таблица partners
id name telegram_id username ref_code traffic_source created_at 
Таблица clicks
id ref_code timestamp ip 
Таблица leads
id ref_code name telegram contact status created_at 
Таблица payouts
id partner_id amount status created_at 
11. Уведомления
Когда появляется новый лид:
бот отправляет уведомление админу (t.me/petrfirstov):
Новый лид
Источник: ref_1045
Имя: Иван
Контакт: @ivan
12. Стек
Предпочтительный стек:
Telegram Bot API
Node.js / Python
PostgreSQL
Webhook
13. UX требования
Интерфейс должен быть:
простым
минималистичным
понятным
Использовать кнопки Telegram.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://petrfirstov.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f6375b1a-2635-43c0-91e1-42df9d942106).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
