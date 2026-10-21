# PicNest Frontend - Быстрый старт

## 🚀 Установка и запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте переменные окружения

Файл `.env` уже создан. При необходимости измените:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Запустите проект в режиме разработки

```bash
npm run dev
```

Проект будет доступен по адресу: http://localhost:5173

## 📋 Структура проекта

```
src/
├── lib/                    # Утилиты и конфигурации
│   └── axios.ts           # Axios с интерсепторами авторизации
├── types/                  # TypeScript типы и Zod схемы
│   └── auth.ts            # Типы аутентификации
├── services/               # API сервисы
│   └── auth.ts            # Функции аутентификации (login, register, etc.)
├── store/                  # Zustand сторы
│   └── authStore.ts       # Состояние авторизации
├── components/             # React компоненты
│   └── ProtectedRoute.tsx # Защита маршрутов с RBAC
├── App.tsx                 # Основной компонент и роутинг
└── main.tsx               # Точка входа
```

## 🔑 Основные функции

### Аутентификация

- **Регистрация**: POST `/api/v1/auth/register`
- **Вход в систему**: POST `/api/v1/auth/login`
- **Обновление токена**: POST `/api/v1/auth/refresh`
- **Профиль пользователя**: GET `/api/v1/auth/users/me`

### Роли пользователей

| Роль | Описание |
|------|----------|
| `photographer` | Фотограф |
| `studio` | Владелец студии |
| `admin` | Администратор системы |

### Защита маршрутов

- `/dashboard` - Доступен всем авторизованным пользователям
- `/studio/*` - Только для ролей `studio` и `admin`
- `/admin/*` - Только для роли `admin`
- `/photographer/*` - Только для роли `photographer`

## 🛠️ API Сервисы

### Регистрация пользователя

```typescript
import { register } from './services/auth';

const user = await register({
  email: 'user@example.com',
  password: 'SecurePass123',
  name: 'Иван Иванов',
  role: 'photographer' // или 'studio' | 'admin'
});
```

### Вход в систему

```typescript
import { login } from './services/auth';

const user = await login({
  email: 'user@example.com',
  password: 'SecurePass123'
});
```

### Выход из системы

```typescript
import { logout } from './services/auth';

logout(); // Очищает токены и перенаправляет на /login
```

## 📚 Документация

- [`AUTHENTICATION.md`](./AUTHENTICATION.md) - Полная документация по аутентификации и защите маршрутов
- [README.md](./README.md) - Документация по API клиенту и типам данных

## 🐛 Отладка

### Проверка токенов в браузере

1. Откройте DevTools (F12)
2. Перейдите во вкладку **Application** → **Local Storage**
3. Проверьте ключи: `accessToken`, `refreshToken`

### Проверка состояния аутентификации

```typescript
import { useAuthStore } from './store/authStore';

function DebugComponent() {
  const store = useAuthStore();
  
  return (
    <pre>
      {JSON.stringify({
        isAuthenticated: store.isAuthenticated,
        user: store.user,
        isLoading: store.isLoading,
      }, null, 2)}
    </pre>
  );
}
```

## 📦 Дополнительные команды

### Запуск тестов

```bash
npm run test
```

### Проверка типов

```bash
npm run type-check
```

### Лinting кода

```bash
npm run lint
```

### Сборка production-версии

```bash
npm run build
```

## 🤝 Вклад в проект

1. Создайте новую ветку: `git checkout -b feature/your-feature`
2. Сделайте изменения и протестируйте
3. Отправьте пул-реквест с описанием изменений

---

**Технологический стек:** Vite, React 18+, TypeScript, Tailwind CSS, Zustand, TanStack Query, Axios, Zod

**Backend API:** FastAPI (Python)
