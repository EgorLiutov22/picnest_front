import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { OrderSummary, OrderStatus, OrderType } from '../../types/orders';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-brand-soft text-brand',
  completed: 'bg-surface text-muted',
  cancelled: 'bg-red-50 text-red-600',
  disputed: 'bg-orange-50 text-orange-700',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Ожидает подтверждения',
  confirmed: 'Подтверждён',
  in_progress: 'В работе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  disputed: 'Спор',
};

const TYPE_LABELS: Record<OrderType, string> = {
  photographer_only: 'Фотограф',
  studio_only: 'Зал студии',
  combined: 'Фотограф + зал',
};

interface OrdersListProps {
  orders: OrderSummary[];
  onCancelOrder?: (orderId: number) => void;
  isCancelling?: boolean;
  onCreate?: () => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, onCancelOrder, isCancelling, onCreate }) => {
  if (orders.length === 0) {
    return <EmptyOrdersState onCreate={onCreate} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onCancel={onCancelOrder ? () => onCancelOrder(order.id) : undefined}
          isCancelling={isCancelling}
        />
      ))}
    </div>
  );
};

const OrderCard: React.FC<{ order: OrderSummary; onCancel?: () => void; isCancelling?: boolean }> = ({
  order,
  onCancel,
  isCancelling,
}) => {
  const canCancel = order.status === 'pending_payment' || order.status === 'confirmed';

  return (
    <article className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-brand-soft">
          <img src="/img/icons/symbol-calendar.png" alt="" className="w-5" />
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold tracking-[-0.5px] text-ink">Заказ №{order.id}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-sm text-muted">
            {TYPE_LABELS[order.order_type]} · создан {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <div className="flex items-center gap-2">
          <img src="/img/icons/symbol-tag.png" alt="" className="w-4" />
          <span className="text-lg font-bold text-ink">{formatPrice(order.total_price)}</span>
        </div>
        {onCancel && canCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCancelling}
            className="btn-secondary px-4 py-2.5 text-sm text-red-600"
          >
            {isCancelling ? 'Отмена…' : 'Отменить'}
          </button>
        )}
      </div>
    </article>
  );
};

const EmptyOrdersState: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-card bg-brand-soft">
      <img src="/img/icons/card-symbol-calendar.png" alt="" className="w-6" />
    </span>
    <h3 className="text-2xl font-bold tracking-[-0.5px] text-ink">Пока нет бронирований</h3>
    <p className="max-w-[420px] text-base leading-[1.55] text-muted">
      Выберите зал студии, дату и время — бронирование появится здесь.
    </p>
    {onCreate && (
      <button type="button" onClick={onCreate} className="btn-primary mt-2">
        Создать бронирование
      </button>
    )}
  </div>
);

const formatDate = (value: string): string => {
  try {
    return format(new Date(value), 'd MMMM yyyy, HH:mm', { locale: ru });
  } catch {
    return value;
  }
};

const formatPrice = (value: string): string => {
  const num = Number(value);
  if (Number.isNaN(num)) return `${value} ₽`;
  return `${num.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;
};

export default OrdersList;
