import { z } from 'zod';

/**
 * Типы данных для модуля бронирования и заказов
 */

/**
 * Интерфейс заказа (бронирования) фотостудии
 */
export interface Order {
  id: string;
  room_id: string;
  start_time: string;    // ISO datetime или HH:mm
  end_time: string;      // ISO datetime или HH:mm
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Схема валидации заказа (Zod)
 */
export const OrderSchema: z.ZodType<Order> = z.object({
  id: z.string(),
  room_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  total_price: z.number().positive('Общая стоимость должна быть положительной'),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  customer_name: z.string().nullable().optional(),
  customer_email: z.string().email('Некорректный email').nullable().optional(),
  customer_phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Интерфейс запроса на создание заказа
 */
export interface CreateOrderRequest {
  room_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
}

/**
 * Схема валидации запроса на создание заказа (Zod)
 */
export const CreateOrderRequestSchema: z.ZodType<CreateOrderRequest> = z.object({
  room_id: z.string().min(1, 'Выберите комнату/зал'),
  start_time: z.string().min(1, 'Укажите время начала'),
  end_time: z.string().min(1, 'Укажите время окончания'),
  total_price: z.number()
    .positive('Общая стоимость должна быть положительной')
    .finite('Некорректная стоимость'),
  customer_name: z.string().optional(),
  customer_email: z.string().email('Некорректный email').optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // start_time должен быть раньше end_time
    const startTime = new Date(`1970-01-01T${data.start_time}Z`).getTime();
    const endTime = new Date(`1970-01-01T${data.end_time}Z`).getTime();
    return startTime < endTime;
  },
  {
    message: 'Время окончания должно быть позже времени начала',
    path: ['end_time'],
  }
);

/**
 * Интерфейс временного слота для бронирования
 */
export interface BookingSlot {
  id: string;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  isAvailable: boolean;    // доступен ли слот
}

/**
 * Интерфейс доступных временных слотов для комнаты
 */
export interface RoomAvailability {
  room_id: string;
  room_name: string;
  date: string;            // YYYY-MM-DD
  availableSlots: BookingSlot[];
}

/**
 * Типы статусов заказа
 */
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * Схема валидации статуса заказа (Zod)
 */
export const OrderStatusSchema: z.ZodType<OrderStatus> = z.enum(['pending', 'confirmed', 'cancelled']);

/**
 * Интерфейс ответа от сервера после создания заказа
 */
export interface CreateOrderResponse {
  order: Order;
  message?: string;
}

/**
 * Интерфейс для валидации формы бронирования
 */
export interface BookingFormData extends CreateOrderRequest {
  // Дополнительные поля для валидации формы
  booking_date: string;    // Дата бронирования (YYYY-MM-DD)
  selected_slot_id: string; // Выбранный временной слот
}

/**
 * Схема полной валидации данных формы бронирования (Zod).
 * CreateOrderRequestSchema — ZodEffects (из-за .refine), у него нет .extend(),
 * поэтому поля формы описаны отдельной схемой.
 */
export const BookingFormDataSchema = z.object({
  room_id: z.string().min(1, 'Выберите комнату/зал'),
  start_time: z.string().min(1, 'Укажите время начала'),
  end_time: z.string().min(1, 'Укажите время окончания'),
  total_price: z.number().positive('Общая стоимость должна быть положительной'),
  customer_name: z.string().optional(),
  customer_email: z.string().email('Некорректный email').optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
  booking_date: z.string().min(1, 'Выберите дату'),
  selected_slot_id: z.string().min(1, 'Выберите временной слот'),
});

/**
 * Интерфейс для выбора комнаты
 */
export interface RoomSelection {
  id: string;
  name: string;
  hourly_rate?: number;     // почасовая ставка
}

/**
 * Схема валидации выбора комнаты (Zod)
 */
export const RoomSelectionSchema: z.ZodType<RoomSelection> = z.object({
  id: z.string(),
  name: z.string(),
  hourly_rate: z.number().optional(),
});

/**
 * Интерфейс ошибки валидации формы
 */
export interface FormValidationErrors {
  room_id?: string;
  start_time?: string;
  end_time?: string;
  total_price?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
}
