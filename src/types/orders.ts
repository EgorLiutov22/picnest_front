import { z } from 'zod';

/**
 * Типы заказов, повторяющие Pydantic-схемы бэкенда
 * (app/schemas/orders/schemas.py).
 */

export const OrderStatusSchema = z.enum([
  'pending_payment',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderTypeSchema = z.enum(['photographer_only', 'studio_only', 'combined']);

export type OrderType = z.infer<typeof OrderTypeSchema>;

/**
 * Краткая карточка заказа — элемент списка (GET /api/v1/orders).
 */
export const OrderSummarySchema = z.object({
  id: z.number(),
  order_type: OrderTypeSchema,
  status: OrderStatusSchema,
  // Decimal на бэкенде приходит строкой
  total_price: z.string(),
  created_at: z.string(),
});

export type OrderSummary = z.infer<typeof OrderSummarySchema>;

/**
 * Ответ списка заказов: бэкенд отдаёт объект с пагинацией, а не массив.
 */
export const OrdersListResponseSchema = z.object({
  items: z.array(OrderSummarySchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type OrdersListResponse = z.infer<typeof OrdersListResponseSchema>;

/**
 * Позиция заказа в детальном ответе.
 */
export const OrderItemSchema = z.object({
  id: z.number(),
  photographer_id: z.number().nullable().optional(),
  photographer_service_id: z.number().nullable().optional(),
  studio_room_id: z.number().nullable().optional(),
  start_time: z.string(),
  end_time: z.string(),
  fixed_price: z.string(),
  fixed_conditions: z.record(z.string(), z.unknown()).nullable().optional(),
  studio_room_info: z
    .object({
      id: z.number(),
      name: z.string(),
      studio_title: z.string(),
      address: z.string(),
      fixed_price: z.string(),
    })
    .nullable()
    .optional(),
  photographer_info: z
    .object({
      id: z.number(),
      display_name: z.string(),
      service_title: z.string().nullable().optional(),
      fixed_price: z.string(),
    })
    .nullable()
    .optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Детальный заказ (GET /api/v1/orders/{id}).
 */
export const OrderDetailSchema = OrderSummarySchema.extend({
  prepayment_amount: z.string(),
  client_id: z.string().optional(),
  items: z.array(OrderItemSchema),
  cancellation_conditions: z.record(z.string(), z.unknown()).optional(),
});

export type OrderDetail = z.infer<typeof OrderDetailSchema>;

/**
 * Ответ на отмену заказа.
 */
export const OrderCancelResponseSchema = z.object({
  order_id: z.number(),
  status: OrderStatusSchema,
  refund_amount: z.string(),
  refund_percentage: z.number(),
  cancellation_reason: z.string().nullable().optional(),
  cancelled_at: z.string(),
});

export type OrderCancelResponse = z.infer<typeof OrderCancelResponseSchema>;

/**
 * Зал студии для выбора в форме бронирования.
 * Отдельный эндпоинт списка залов пока не реализован, поэтому данные
 * передаются в компонент пропсом.
 */
export interface StudioRoomOption {
  id: number;
  name: string;
  price_per_hour: string;
  studio_title?: string;
}

/**
 * Запрос на создание заказа — соответствует OrderCreate бэкенда.
 * Бэкенд ожидает время в ISO 8601 с часовым поясом.
 *
 * Ресурс указывается универсальной парой resource_type/resource_id:
 * старые поля photographer_id/studio_room_id в запросе больше не
 * принимаются. order_type не передаётся — тип выводит сервер.
 */
export interface CreateOrderPayload {
  items: Array<{
    resource_type: 'studio_room' | 'photographer';
    resource_id: number;
    service_id?: number;
    start_time: string;
    end_time: string;
  }>;
  prepayment_amount: string;
  cancellation_conditions?: Record<string, unknown>;
}

/**
 * Значения полей формы бронирования до преобразования в CreateOrderPayload.
 */
export interface BookingFormValues {
  studio_room_id: number;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  prepayment_amount: string;
}

