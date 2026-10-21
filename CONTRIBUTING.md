# Руководство для разработчиков PicNest

Пожалуйста, прочитайте это руководство перед внесением изменений в проект.

## 📋 Содержание

- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [Стиль кода](#стиль-кода)
- [Коммиты Git](#коммиты-git)
- [Pull Requests](#pull-requests)

## 📁 Структура проекта

```
picnest_front/
├── src/
│   ├── lib/                    # Утилиты и конфигурации
│   │   └── axios.ts           # Axios с интерсепторами
│   ├── types/                  # TypeScript типы и Zod схемы
│   │   └── auth.ts            # Типы аутентификации
│   ├── services/               # API сервисы
│   │   └── auth.ts            # Сервис аутентификации
│   ├── store/                  # Zustand сторы
│   │   └── authStore.ts       # Состояние аутентификации
│   ├── components/             # React компоненты
│   │   └── ProtectedRoute.tsx # Защита маршрутов
│   ├── App.tsx                 # Основной компонент
│   ├── main.tsx                # Точка входа
│   └── index.css               # Глобальные стили
├── public/                     # Статические файлы
├── .env                        # Переменные окружения
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Установка и запуск

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

# Создание файла окружения
cp .env.example .env
```

### Запуск в режиме разработки

```bash
npm run dev
```

Проект будет доступен по адресу: http://localhost:5173

## 🎨 Стиль кода

### TypeScript

- ❌ Избегайте `any` - используйте строгую типизацию
- ✅ Всегда определяйте типы для props, state и API ответов
- ✅ Используйте интерфейсы для внешних данных
- ✅ Предпочитайте `type` для union types и `interface` для object types

**Пример:**

```typescript
// ❌ Плохо
const user: any = await api.getUser();

// ✅ Хорошо
interface User {
  id: string;
  email: string;
}

const user: User = await api.getUser();
```

### React Components

- Используйте функциональные компоненты с хуками
- Разделяйте компоненты на мелкие, переиспользуемые части
- Импортируйте типы из `@/types` и интерфейсы из `@/store`

**Пример:**

```typescript
import { type User } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

interface UserProfileProps {
  userId: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{user?.name}</div>;
};
```

### Styling с Tailwind CSS

- Используйте классы Tailwind для стилей
- Избегайте inline-стилей
- Группируйте связанные стили в `@layer components`

**Пример:**

```typescript
// ❌ Плохо
<div style={{ padding: '10px', margin: '20px' }}>Content</div>

// ✅ Хорошо
<div className="p-4 m-5">Content</div>
```

### Zod валидация

- Все входные данные должны проходить валидацию через Zod схемы
- Используйте схемы из `@/types/auth` для аутентификации

**Пример:**

```typescript
import { LoginRequestSchema } from '@/types/auth';

const validatedData = LoginRequestSchema.parse({ email, password });
await api.login(validatedData);
```

## 📝 Коммиты Git

### Формат коммитов

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы изменений

| Тип | Описание | Пример |
|-----|----------|--------|
| `feat` | Новая функция | `feat(auth): add login functionality` |
| `fix` | Исправление бага | `fix(protected-route): fix role check issue` |
| `docs` | Изменения документации | `docs: update README.md` |
| `style` | Форматирование, пробелы и т.д. | `style(auth.ts): format code` |
| `refactor` | Рефакторинг кода | `refactor(store): simplify auth state` |
| `test` | Добавление тестов | `test: add unit tests for login` |
| `chore` | Конфигурация, зависимости и т.д. | `chore: update dependencies` |

### Правила написания коммитов

1. **Подзаголовок** в present tense (настоящем времени): "add" вместо "added"
2. **Не завершать** подзаголовок точкой
3. **Максимум 50 символов** в подзаголовке
4. **Отделять тело от заголовка** пустой строкой

**Пример:**

```bash
feat(auth): add protected route component

- Add requiredRole prop for RBAC support
- Implement loading state during auth check
- Show error page when role doesn't match
```

### Ветвление Git

Используйте следующие префиксы для веток:

| Префикс | Описание | Пример |
|---------|----------|--------|
| `feat/` | Новая функция | `feat/user-profile` |
| `fix/` | Исправление бага | `fix/login-error-message` |
| `docs/` | Документация | `docs/api-endpoints` |
| `refactor/` | Рефакторинг | `refactor/auth-store` |
| `test/` | Тесты | `test/auth-service` |
| `chore/` | Конфигурация | `chore/update-deps` |

**Пример:**

```bash
git checkout -b feat/rbac-implementation
```

## 🔀 Pull Requests

### Подготовка к PR

1. **Обновите ветку** основной ветки перед созданием PR:
   ```bash
   git fetch origin main
   git rebase origin/main
   ```

2. **Проведите ревью кода** самостоятельно:
   - Проверьте логические ошибки
   - Убедитесь в наличии типов
   - Проверьте форматирование

3. **Запустите тесты**:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

### Описание PR

Используйте следующий шаблон для описания:

```markdown
## 📝 Описание

Краткое описание изменений и причины их внесения.

## 🔗 Связанные задачи

- Closes #123
- Related to #456

## ✅ Проверки

- [ ] Код следует стилю проекта
- [ ] Добавлены тесты при необходимости
- [ ] Обновлена документация
- [ ] Коммиты следуют Conventional Commits
```

### Code Review

Все PR должны получить минимум **1 approval** от других разработчиков перед мержем.

## 🧪 Тестирование

### Запуск тестов

```bash
# Unit тесты
npm run test

# E2E тесты (если настроены)
npm run test:e2e
```

### Покрываемость кода

Стремитесь к **80%+** покрытия кода для критических модулей:
- Аутентификация (`src/services/auth.ts`)
- Защита маршрутов (`src/components/ProtectedRoute.tsx`)
- Store (`src/store/authStore.ts`)

## 📚 Ресурсы

- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Вопросы и поддержка

Если у вас возникли вопросы:

1. Проверьте существующую документацию в проекте
2. Создайте issue на GitHub с тегом `question`
3. Спросите в команде через Slack/Telegram

---

Спасибо за вклад в PicNest! 🎉
