# PicNest Frontend - Установка зависимостей

Этот файл содержит инструкции по установке всех необходимых зависимостей для проекта.

## 📦 Основные зависимости

Установите все необходимые пакеты:

```bash
npm install axios zod zustand react-router-dom @tanstack/react-query date-fns
```

## 🎨 Зависимости для календаря и UI

Для модуля расписания требуется:

```bash
npm install react-day-picker
```

## 🔔 Уведомления (опционально)

Для отображения уведомлений при успешных/ошибочных операциях:

```bash
npm install react-hot-toast
```

## 🧪 Зависимости для разработки

Установите зависимости для разработки и тестирования:

```bash
npm install -D \
  @types/node \
  @types/react \
  @types/react-dom \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  @vitejs/plugin-react \
  autoprefixer \
  eslint \
  eslint-plugin-react-hooks \
  eslint-plugin-react-refresh \
  postcss \
  tailwindcss \
  typescript \
  vite \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  jest-environment-jsdom
```

## 📝 Полный список зависимостей в package.json

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "date-fns": "^3.0.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.21.3",
    "zod": "^3.22.4",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

## 🚀 Быстрая установка

Для быстрой установки всех зависимостей выполните:

```bash
npm install \
  axios zod zustand react-router-dom @tanstack/react-query date-fns \
  react-day-picker react-hot-toast \
  @types/node @types/react @types/react-dom \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  @vitejs/plugin-react autoprefixer eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh \
  postcss tailwindcss typescript vite \
  @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

## ⚠️ Примечания

1. **Node.js версия**: Убедитесь, что у вас установлен Node.js версии >= 18
2. **npm vs yarn**: Эти инструкции для npm. Если используете yarn или pnpm, замените `npm install` на соответствующую команду
3. **Проблемы с установкой**: Если возникают проблемы, попробуйте:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

## 📋 Проверка установки

После установки проверьте, что все пакеты установлены правильно:

```bash
npm list axios zod zustand react-router-dom @tanstack/react-query date-fns react-day-picker
```

Все зависимости должны быть указаны как `installed`.

---

**Приятной разработки!** 🎉
