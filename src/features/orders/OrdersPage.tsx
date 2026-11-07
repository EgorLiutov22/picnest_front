import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import BookingForm from './BookingForm';
import OrdersList from './OrdersList';
import type { RoomSelection } from '../../types/orders';

/**
 * Интерфейс пропсов для страницы заказов
 */
interface OrdersPageProps {
  /** Список доступных комнат/залов (для формы бронирования) */
  availableRooms: RoomSelection[];
}

/**
 * Страница управления заказами/бронированиями
 * Отображает форму создания нового бронирования и список существующих заказов
 */
export const OrdersPage: React.FC<OrdersPageProps> = ({ availableRooms }) => {
  const navigate = useNavigate();
  
  // Используем хук для работы с заказами
  const { ordersList, isLoadingOrders, errorOrders } = useOrders();

  /**
   * Обработчик отмены заказа
   */
  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Вы уверены, что хотите отменить это бронирование?')) {
      console.log(`Отмена заказа ${orderId}`);
      // TODO: Вызов мутации для отмены заказа
      // await cancelOrder(orderId);
    }
  };

  /**
   * Обработчик клика на "Создать новое бронирование"
   */
  const handleNewBooking = () => {
    navigate('/studio/book');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Верхняя панель с заголовком и кнопкой */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Бронирования</h1>
              <p className="mt-2 text-gray-600">Управление заказами и создание новых бронирований</p>
            </div>
            <button
              onClick={handleNewBooking}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать бронирование
            </button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Левая колонка - Форма бронирования */}
          <div className="xl:col-span-2">
            <BookingForm availableRooms={availableRooms} />
          </div>

          {/* Правая колонка - Список заказов */}
          <div className="xl:col-span-1">
            {isLoadingOrders ? (
              <LoadingState />
            ) : errorOrders ? (
              <ErrorState error={errorOrders.message} onRetry={() => window.location.reload()} />
            ) : (
              <OrdersList 
                orders={ordersList} 
                onCancelOrder={handleCancelOrder}
              />
            )}

            {/* Информация */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700">
                  Новые бронирования создаются автоматически. 
                  Администратор подтвердит их в ближайшее время.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Всего бронирований" 
            value={ordersList.length.toString()} 
            icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard 
            title="Активных" 
            value={ordersList.filter(o => o.status === 'confirmed' || o.status === 'pending').length.toString()} 
            icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            title="Отменено" 
            value={ordersList.filter(o => o.status === 'cancelled').length.toString()} 
            icon={<svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      </div>

      {/* Подвал */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-500">
          Если у вас возникли вопросы, обратитесь в службу поддержки.
        </p>
      </footer>
    </div>
  );
};

/**
 * Компонент статистической карточки
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-2">
      {icon}
    </div>
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

/**
 * Компонент состояния загрузки
 */
const LoadingState = () => (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-gray-600">Загрузка заказов...</p>
  </div>
);

/**
 * Компонент состояния ошибки
 */
interface ErrorStateProps {
  error?: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="bg-white rounded-lg shadow-md p-8 text-center">
    <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-gray-600 mb-4">{error || 'Ошибка загрузки заказов'}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Повторить
    </button>
  </div>
);

export default OrdersPage;
