import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuthStore } from '../../store/authStore';
import { PageLayout } from '../../components/Layout';
import BookingForm from './BookingForm';
import OrdersList from './OrdersList';
import type { StudioRoomOption } from '../../types/orders';

interface OrdersPageProps {
  availableRooms: StudioRoomOption[];
}

/**
 * Личный кабинет клиента: свои бронирования и форма создания нового.
 * Список — GET /api/v1/orders по токену, отмена — POST /orders/{id}/cancel.
 */
export const OrdersPage: React.FC<OrdersPageProps> = ({ availableRooms }) => {
  const [params, setParams] = useSearchParams();
  const showForm = params.get('new') === '1';
  const setShowForm = (v: boolean) => setParams(v ? { new: '1' } : {}, { replace: true });

  const user = useAuthStore((s) => s.user);
  const { orders, total, isLoading, error, refetch, cancelOrder, isCancelling } = useOrders();

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('Отменить это бронирование? Сумма возврата зависит от времени до начала съёмки.')) {
      cancelOrder({ orderId });
    }
  };

  const activeCount = orders.filter((o) => o.status === 'pending_payment' || o.status === 'confirmed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const firstName = user?.first_name;

  return (
    <PageLayout className="bg-surface">
      <section className="border-b border-line bg-white">
        <div className="container-pn flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h1 className="mt-2 text-[32px] font-bold leading-[1.1] tracking-tighter2 text-ink md:text-[40px]">
              {firstName ? `${firstName}, ваши бронирования` : 'Ваши бронирования'}
            </h1>
          </div>
          <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary self-start md:self-auto">
            {showForm ? 'Скрыть форму' : '+ Новое бронирование'}
          </button>
        </div>
      </section>

      <div className="container-pn flex flex-col gap-8 py-10">
        {showForm && <BookingForm availableRooms={availableRooms} onCreated={() => setShowForm(false)} />}

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error.message} onRetry={() => refetch()} />
            ) : (
              <OrdersList
                orders={orders}
                onCancelOrder={handleCancelOrder}
                isCancelling={isCancelling}
                onCreate={() => setShowForm(true)}
              />
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <Stat label="Всего" value={total} />
              <Stat label="Активных" value={activeCount} accent />
              <Stat label="Отменено" value={cancelledCount} />
            </div>

            <div className="rounded-panel bg-ink p-6 text-white">
              <p className="text-[13px] font-semibold text-white/70">Условия отмены</p>
              <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-[1.55] text-white/85">
                <li>100% возврат — за 24 часа и более до начала.</li>
                <li>Бронь менее чем за сутки — 15 минут на отмену с возвратом.</li>
                <li>Неоплаченный заказ отменяется в любой момент.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

const Stat: React.FC<{ label: string; value: number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="card p-5">
    <p className="text-sm text-muted">{label}</p>
    <p className={`mt-1 text-[28px] font-bold leading-none tracking-tighter2 ${accent ? 'text-brand' : 'text-ink'}`}>
      {value}
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Загрузка заказов">
    {[0, 1, 2].map((i) => (
      <div key={i} className="card h-[104px] animate-pulse bg-white" />
    ))}
  </div>
);

const ErrorState: React.FC<{ message?: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
    <h3 className="text-xl font-bold text-ink">Не удалось загрузить заказы</h3>
    <p className="text-sm text-muted">{message || 'Неизвестная ошибка'}</p>
    <button type="button" onClick={onRetry} className="btn-primary mt-2">
      Повторить
    </button>
  </div>
);

export default OrdersPage;
