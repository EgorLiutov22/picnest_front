# PicNest Frontend 📸

Маркетплейс фотостудий и фотографов на React, TypeScript и Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.2-orange?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)

## 🚀 Быстрый старт

### Требования

- Node.js >= 18
- npm >= 9

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-org/picnest_front.git
cd picnest_front

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
```

### Запуск

```bash
npm run dev
```

Проект будет доступен по адресу: **http://localhost:5173**

## 📚 Документация

- **[QUICKSTART.md](./QUICKSTART.md)** - Быстрый старт и основные команды
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Полная документация по аутентификации и защите маршрутов
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Руководство для разработчиков

## 🛠️ Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Фреймворк** | React 18+, Vite |
| **Язык** | TypeScript 5.x |
| **Стилизация** | Tailwind CSS |
| **Роутинг** | React Router v6 |
| **State Management** | Zustand |
| **Query Management** | TanStack Query (React Query) |
| **HTTP Client** | Axios |
| **Валидация** | Zod |

## 📦 Основные возможности

### 🔐 Аутентификация и авторизация

- Регистрация и вход пользователей с JWT токенами
- Автоматическое обновление токенов через refresh token
- RBAC (Role-Based Access Control) для разграничения прав доступа
- Защита маршрутов с компонентом `ProtectedRoute`

### 👥 Роли пользователей

| Роль | Описание | Доступ |
|------|----------|--------|
| **photographer** | Фотограф | Свои бронирования, портфолио |
| **studio** | Владелец студии | Управление студией и расписанием |
| **admin** | Администратор | Полный доступ ко всем функциям |

### 🎨 Маршруты

| Путь | Описание | Доступ |
|------|----------|--------|
| `/` | Главная страница | Все пользователи |
| `/login` | Страница входа | Неавторизованные |
| `/register` | Регистрация | Неавторизованные |
| `/dashboard` | Панель управления | Авторизованные |
| `/studio/*` | Управление студией | `studio`, `admin` |
| `/admin/*` | Административная панель | `admin` |

## 📂 Структура проекта

```
picnest_front/
├── src/
│   ├── lib/                    # Утилиты и конфигурации
│   │   └── axios.ts           # Axios с интерсепторами авторизации
│   ├── types/                  # TypeScript типы и Zod схемы
│   │   └── auth.ts            # Типы аутентификации
│   ├── services/               # API сервисы
│   │   └── auth.ts            # Сервис аутентификации
│   ├── store/                  # Zustand сторы
│   │   └── authStore.ts       # Состояние аутентификации
│   ├── components/             # React компоненты
│   │   └── ProtectedRoute.tsx # Защита маршрутов с RBAC
│   ├── App.tsx                 # Основной компонент и роутинг
│   ├── main.tsx                # Точка входа
│   └── index.css               # Глобальные стили
├── public/                     # Статические файлы
├── .env                        # Переменные окружения
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 📋 Команды

### Разработка

```bash
# Запуск dev-сервера
npm run dev

# Сборка production версии
npm run build

# Просмотр production сборки
npm run preview
```

### Лinting и проверка типов

```bash
# Проверка типов
npm run type-check

# Linting кода
npm run lint
```

## 🔧 Конфигурация окружения

Создайте файл `.env` на основе `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🤝 Вклад в проект

Пожалуйста, ознакомьтесь с нашим [руководством для разработчиков](./CONTRIBUTING.md) перед внесением изменений.

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробнее в файле [LICENSE](./LICENSE).

---

**Создано с ❤️ для PicNest команды**
