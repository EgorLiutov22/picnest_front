# PicNest - Модуль Расписания Фотостудии 📅

Полная документация по управлению расписанием фотостудий в проекте PicNest.

## 📦 Структура модуля

```
src/features/schedule/
├── index.ts                    # Экспорт компонентов
├── ScheduleCalendar.tsx        # Календарь с визуализацией дней
├── ScheduleList.tsx            # Список исключений и блокировок
├── MonthNavigation.tsx         # Навигация по месяцам
└── ScheduleManager.tsx         # Основной компонент управления

src/hooks/
└── useSchedule.ts              # Хуки на базе TanStack Query

src/types/
└── schedule.ts                 # TypeScript типы и Zod схемы
```

## 🎯 Возможности модуля

### Визуализация расписания

- **Календарь с цветовым кодированием**:
  - 🟢 Зеленый - обычный рабочий день
  - 🔴 Красный - выходной (исключение типа `closed`)
  - 💛 Желтый - кастомное время работы (исключение типа `custom`)
  - ⚫ Серый - заблокированный слот

### Управление исключениями

- **Выходные дни**: Студия не работает в определенные даты
- **Кастомное время**: Изменение времени работы на конкретную дату
- **Описание**: Добавление примечаний к исключениям

### Блокировка слотов

- **Выбор временного слота**: Утро, День, Вечер (стандартные интервалы)
- **Причина блокировки**: Обоснование для блокировки
- **Временная блокировка**: На конкретный день и время

## 📋 Типы данных

### ScheduleTemplate

```typescript
interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  slots: WeeklyScheduleSlot[];
  created_at: string;
  updated_at: string;
}
```

### ScheduleException

```typescript
interface ScheduleException {
  id: string;
  date: string;            // YYYY-MM-DD
  exception_type: 'closed' | 'custom';
  open_time?: string | null;   // для custom типа (HH:mm)
  close_time?: string | null;  // для custom типа (HH:mm)
  description?: string | null; // описание исключения
  created_at: string;
}
```

### ScheduleBlock

```typescript
interface ScheduleBlock {
  id: string;
  date: string;            // YYYY-MM-DD
  slot_id: string;         // ID временного слота (например, "morning")
  reason?: string | null;  // причина блокировки
  created_at: string;
}
```

### TimeSlot

Стандартные временные интервалы для фотостудий:

```typescript
interface TimeSlot {
  id: string;
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  label: string;         // читаемое название
}

export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', startTime: '09:00', endTime: '12:00', label: 'Утро (09:00 - 12:00)' },
  { id: 'midday', startTime: '12:00', endTime: '15:00', label: 'День (12:00 - 15:00)' },
  { id: 'afternoon', startTime: '15:00', endTime: '18:00', label: 'Вечер (15:00 - 18:00)' },
  { id: 'evening', startTime: '18:00', endTime: '21:00', label: 'Вечер (18:00 - 21:00)' },
];
```

## 🚀 Использование компонентов

### ScheduleManager

Основной компонент для управления расписанием.

```tsx
import { ScheduleManager } from './features/schedule';

function App() {
  return <ScheduleManager />;
}
```

### ScheduleCalendar

Календарь с визуализацией дней.

```tsx
import { ScheduleCalendar, type ScheduleException, type ScheduleBlock } from './features/schedule';

interface MyComponentProps {
  exceptions: ScheduleException[];
  blocks: ScheduleBlock[];
}

const MyComponent: React.FC<MyComponentProps> = ({ exceptions, blocks }) => {
  return (
    <ScheduleCalendar
      currentYear={2024}
      currentMonth={10}
      exceptions={exceptions}
      blocks={blocks}
      onDayClick={(date) => console.log('Выбран день:', date)}
    />
  );
};
```

### ScheduleList

Список исключений и блокировок.

```tsx
import { ScheduleList } from './features/schedule';

<ScheduleList
  exceptions={exceptions}
  blocks={blocks}
  onRemoveException={(id) => handleDeleteException(id)}
  onRemoveBlock={(id) => handleRemoveBlock(id)}
/>
```

### MonthNavigation

Навигация по месяцам.

```tsx
import { MonthNavigation } from './features/schedule';

<MonthNavigation
  currentYear={2024}
  currentMonth={10}
  onMonthChange={(year, month) => console.log(year, month)}
/>
```

## 📡 API Интеграция

### Хук useSchedule

Комбинированный хук для работы с расписанием.

```tsx
import { useSchedule } from './hooks/useSchedule';

function MyComponent() {
  const {
    templates,      // Список шаблонов расписания
    exceptions,     // Исключения в текущем месяце
    blocks,         // Заблокированные слоты
    isLoadingTemplates,
    isLoadingExceptions,
    isLoadingBlocks,
    createException,
    createBlock,
    deleteException,
    deleteBlock,
  } = useSchedule(2024, 10);

  return (
    <div>
      <h1>Расписание на Октябрь 2024</h1>
      {/* ... */}
    </div>
  );
}
```

### Хук useCreateException

Создание исключения в расписании.

```tsx
import { useCreateException } from './hooks/useSchedule';

function AddException() {
  const createException = useCreateException();

  const handleSubmit = async (data: CreateExceptionRequest) => {
    await createException.mutateAsync(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Хук useCreateBlock

Блокировка слота в расписании.

```tsx
import { useCreateBlock } from './hooks/useSchedule';

function BlockSlot() {
  const createBlock = useCreateBlock();

  const handleBlock = async () => {
    await createBlock.mutateAsync({
      date: '2024-10-25',
      slot_id: 'morning',
      reason: 'Технический день'
    });
  };

  return <button onClick={handleBlock}>Заблокировать слот</button>;
}
```

## 🎨 Стилизация и кастомизация

### Цветовая схема дней

Доступные модификаторы для DayPicker:

- `regular` - обычный рабочий день (зеленый)
- `exception_closed` - выходной (красный)
- `exception_custom` - кастомное время (желтый)
- `blocked` - заблокированный слот (серый)

Кастомизация через `modifiersStyles`:

```tsx
<DayPicker
  modifiers={{ regular: isRegularDay }}
  modifiersStyles={{
    regular: { backgroundColor: '#dcfce7' },
    exception_closed: { backgroundColor: '#fee2e2' },
    exception_custom: { backgroundColor: '#fef3c7' },
    blocked: { backgroundColor: '#d1d5db', opacity: 0.6 },
  }}
/>
```

## 🧪 Тестирование

### Unit тесты компонентов

```tsx
import { render, screen } from '@testing-library/react';
import { ScheduleCalendar } from './ScheduleCalendar';

test('отображает календарь для текущего месяца', () => {
  render(
    <ScheduleCalendar
      currentYear={2024}
      currentMonth={10}
      exceptions={[]}
      blocks={[]}
    />
  );
  
  expect(screen.getByText('Октябрь 2024')).toBeInTheDocument();
});
```

### Mock API запросов

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

const createWrapper = () => ({
  wrapper: ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  ),
});

test('загружает исключения для месяца', async () => {
  const { result } = renderHook(() => useScheduleExceptions(2024, 10), {
    wrapper: createWrapper().wrapper,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data).toBeDefined();
});
```

## 🔧 Расширение функциональности

### Добавление новых временных слотов

В файле `src/types/schedule.ts` добавьте новые слоты:

```typescript
export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', startTime: '09:00', endTime: '12:00', label: 'Утро' },
  { id: 'midday', startTime: '12:00', endTime: '15:00', label: 'День' },
  { id: 'afternoon', startTime: '15:00', endTime: '18:00', label: 'Вечер' },
  { id: 'evening', startTime: '18:00', endTime: '21:00', label: 'Ночь' },
  // Добавьте новые слоты здесь
];
```

### Кастомные правила валидации

Расширение Zod схем для специфичных требований:

```typescript
export const CustomScheduleSchema = ScheduleExceptionSchema.extend({
  requires_approval: z.boolean().optional(),
});
```

## 📊 Пример интеграции с бэкендом

### Настройка API URL

В `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Обработка ошибок

```tsx
const { createException, error } = useSchedule(2024, 10);

if (error) {
  toast.error(`Ошибка загрузки расписания: ${error.message}`);
}
```

## 🐛 Отладка

### Проверка состояния кэша

```tsx
import { useQueryClient } from '@tanstack/react-query';

function DebugSchedule() {
  const queryClient = useQueryClient();
  
  return (
    <pre>{JSON.stringify(queryClient.getQueryState(['schedules', 'templates']), null, 2)}</pre>
  );
}
```

### Инвалидация кэша вручную

```tsx
import { useQueryClient } from '@tanstack/react-query';

function RefreshSchedule() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules', 'exceptions'] });
  };

  return <button onClick={handleRefresh}>Обновить расписание</button>;
}
```

## 📝 Чеклист для разработчиков

Перед добавлением новых функций в модуль расписания:

- [ ] Создать TypeScript интерфейсы для новых данных
- [ ] Добавить Zod схемы для валидации
- [ ] Реализовать хук с использованием TanStack Query
- [ ] Создать компоненты UI
- [ ] Добавить обработку ошибок и loading states
- [ ] Протестировать компоненты
- [ ] Обновить документацию

## 📚 Ресурсы

- [React Day Picker Documentation](https://daypicker.dev/)
- [date-fns Documentation](https://date-fns.org/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)

## 🔄 История изменений

### 2024-10-15 - Инициализация модуля
- Созданы базовые типы данных для расписания
- Реализован календарь с цветовой визуализацией
- Добавлены хуки для работы с API
- Созданы компоненты управления расписанием

---

**Готово к использованию!** 🎉
