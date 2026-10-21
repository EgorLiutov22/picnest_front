import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Order, OrderStatus } from '../../types/orders';

/**
 * Интерфейс пропсов для компонента списка заказов
 */
interface OrdersListProps {
  /** Список заказов */
  orders: Order[];
  /** Обработчик клика на отмену заказа */
  onCancelOrder?: (orderId: string) => void;
}

/**
 * Компонент отображения списка заказов/бронирований
 */
export const OrdersList: React.FC<OrdersListProps> = ({ orders, onCancelOrder }) => {
  if (orders.length === 0) {
    return <EmptyOrdersState />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Заголовок */}
      <div className="bg-gray-800 px-4 py-3 text-white flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ваши бронирования</h2>
        <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
          {orders.length} {formatCount(orders.length)}
        </span>
      </div>

      {/* Список заказов */}
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <OrderItem key={order.id} order={order} onCancel={onCancelOrder ? () => onCancelOrder(order.id) : undefined} />
        ))}
      </div>
    </div>
  );
};

/**
 * Компонент элемента заказа
 */
interface OrderItemProps {
  order: Order;
  onCancel?: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onCancel }) => {
  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Заказ #{order.id.substring(0, 8)}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500">Комната</p>
          <p className="font-medium text-gray-900">{order.room_id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Стоимость</p>
          <p className="font-semibold text-green-600">{order.total_price.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500">Время начала</p>
          <p className="font-medium text-gray-900">{formatTime(order.start_time)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Время окончания</p>
          <p className="font-medium text-gray-900">{formatTime(order.end_time)}</p>
        </div>
      </div>

      {order.customer_name && (
        <div className="mb-3">
          <p className="text-sm text-gray-500">Клиент</p>
          <p className="font-medium text-gray-900">{order.customer_name}</p>
        </div>
      )}

      {order.notes && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">Примечание:</p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Кнопки действий */}
      {onCancel && order.status !== 'cancelled' && (
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={onCancel}
            disabled={order.status === 'pending'}
            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отменить бронирование
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент пустого состояния
 */
const EmptyOrdersState = () => (
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    <svg 
      className="mx-auto h-24 w-24 text-gray-300 mb-4" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Нет бронирований</h3>
    <p className="text-gray-500">У вас пока нет активных или завершенных бронирований.</p>
  </div>
);

/**
 * Форматирование даты в читаемом виде
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy \'г\'', { locale: ru });
  } catch (error) {
    return dateString;
  }
};

/**
 * Форматирование времени
 */
const formatTime = (timeString: string): string => {
  try {
    // Если время в формате HH:mm:ss или только HH:mm
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').slice(0, 2);
      return `${hours}:${minutes}`;
    }
    return timeString;
  } catch (error) {
    return timeString;
  }
};

/**
 * Форматирование статуса заказа для отображения
 */
const formatStatus = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
  };
  return statusMap[status];
};

/**
 * Форматирование количества для счетчика
 */
const formatCount = (count: number): string => {
  if (count === 1) return 'бронирование';
  if (count >= 2 && count <= 4) return 'бронирования';
  return 'бронирований';
};

export default OrdersList;
