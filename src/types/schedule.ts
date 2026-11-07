import { z } from 'zod';

/**
 * Типы данных для модуля расписания фотостудии
 */

/**
 * Интерфейс слота в недельном шаблоне
 */
export interface WeeklyScheduleSlot {
  day_of_week: number; // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
  is_open: boolean;    // true = рабочий день, false = выходной
  open_time?: string | null;   // время открытия (HH:mm)
  close_time?: string | null;  // время закрытия (HH:mm)
}

/**
 * Схема валидации слота недельного расписания (Zod).
 * Объявлена до ScheduleTemplateSchema: та ссылается на неё.
 */
export const WeeklyScheduleSlotSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени (HH:mm)').nullable().optional(),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени (HH:mm)').nullable().optional(),
}) satisfies z.ZodType<WeeklyScheduleSlot>;

/**
 * Интерфейс недельного шаблона расписания
 */
export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  slots: WeeklyScheduleSlot[];
  created_at: string;
  updated_at: string;
}

/**
 * Схема валидации шаблона расписания (Zod)
 */
export const ScheduleTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  slots: z.array(WeeklyScheduleSlotSchema),
  created_at: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<ScheduleTemplate>;

/**
 * Интерфейс исключения в расписании (выходной или кастомное время)
 */
export interface ScheduleException {
  id: string;
  date: string;            // YYYY-MM-DD
  exception_type: 'closed' | 'custom';
  open_time?: string | null;   // для custom типа
  close_time?: string | null;  // для custom типа
  description?: string | null; // описание исключения
  created_at: string;
}

/**
 * Схема валидации исключения расписания (Zod)
 */
export const ScheduleExceptionSchema: z.ZodType<ScheduleException> = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)'),
  exception_type: z.enum(['closed', 'custom']),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени').nullable().optional(),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени').nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

/**
 * Интерфейс заблокированного слота
 */
export interface ScheduleBlock {
  id: string;
  date: string;            // YYYY-MM-DD
  slot_id: string;         // ID временного слота (например, "09-12" для 9:00-12:00)
  reason?: string | null;  // причина блокировки
  created_at: string;
}

/**
 * Схема валидации заблокированного слота (Zod)
 */
export const ScheduleBlockSchema: z.ZodType<ScheduleBlock> = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
  slot_id: z.string(),
  reason: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

/**
 * Интерфейс запроса на создание исключения
 */
export interface CreateExceptionRequest {
  date: string;
  exception_type: 'closed' | 'custom';
  open_time?: string;      // требуется только для custom типа
  close_time?: string;     // требуется только для custom типа
  description?: string;    // необязательно
}

/**
 * Схема валидации запроса на создание исключения (Zod)
 */
export const CreateExceptionRequestSchema: z.ZodType<CreateExceptionRequest> = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
  exception_type: z.enum(['closed', 'custom']),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени').optional().refine(
    (val) => {
      if (val === undefined) return true;
      const [hours, minutes] = val.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    },
    'Время должно быть в формате HH:MM'
  ),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Неверный формат времени').optional().refine(
    (val) => {
      if (val === undefined) return true;
      const [hours, minutes] = val.split(':').map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    },
    'Время должно быть в формате HH:MM'
  ),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.exception_type === 'custom') {
      return data.open_time !== undefined && data.close_time !== undefined;
    }
    return true;
  },
  {
    message: 'Для типа "custom" требуются open_time и close_time',
    path: ['exception_type'],
  }
);

/**
 * Интерфейс запроса на блокировку слота
 */
export interface CreateBlockRequest {
  date: string;
  slot_id: string;
  reason?: string;
}

/**
 * Схема валидации запроса на блокировку (Zod)
 */
export const CreateBlockRequestSchema: z.ZodType<CreateBlockRequest> = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты'),
  slot_id: z.string(),
  reason: z.string().optional(),
});

/**
 * Интерфейс ответа от сервера после создания исключения
 */
export interface ExceptionResponse {
  exception: ScheduleException;
  message?: string;
}

/**
 * Интерфейс ответа от сервера после блокировки слота
 */
export interface BlockResponse {
  block: ScheduleBlock;
  message?: string;
}

/**
 * Типы статусов дня в календаре
 */
export type DayStatus = 'regular' | 'exception_closed' | 'exception_custom' | 'blocked';

/**
 * Интерфейс для отображения информации о дне в календаре
 */
export interface CalendarDayInfo {
  date: Date;
  status: DayStatus;
  isOpen?: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  exceptionType?: 'closed' | 'custom';
  reason?: string | null;
}

/**
 * Интерфейс временного слота (9:00-12:00, 12:00-15:00 и т.д.)
 */
export interface TimeSlot {
  id: string;
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  label: string;         // читаемое название (например, "9:00 - 12:00")
}

/**
 * Список стандартных временных слотов для фотостудий
 */
export const STANDARD_TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', startTime: '09:00', endTime: '12:00', label: 'Утро (09:00 - 12:00)' },
  { id: 'midday', startTime: '12:00', endTime: '15:00', label: 'День (12:00 - 15:00)' },
  { id: 'afternoon', startTime: '15:00', endTime: '18:00', label: 'Вечер (15:00 - 18:00)' },
  { id: 'evening', startTime: '18:00', endTime: '21:00', label: 'Вечер (18:00 - 21:00)' },
];
