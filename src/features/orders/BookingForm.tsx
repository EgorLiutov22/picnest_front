import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { CreateOrderRequest, RoomSelection } from '../../types/orders';
import { CreateOrderRequestSchema } from '../../types/orders';

/**
 * Интерфейс пропсов для компонента BookingForm
 */
interface BookingFormProps {
  /** Список доступных комнат/залов для бронирования */
  availableRooms: RoomSelection[];
  /** Идентификатор комнаты по умолчанию (если только одна комната) */
  defaultRoomId?: string;
}

/**
 * Компонент формы оформления бронирования фотостудии
 */
export const BookingForm: React.FC<BookingFormProps> = ({ availableRooms, defaultRoomId }) => {
  const navigate = useNavigate();
  
  // Состояние для отображения информации о стоимости
  const [showPriceSummary, setShowPriceSummary] = useState(false);

  /**
   * Инициализация react-hook-form с валидацией Zod
   */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrderRequest>({
    defaultValues: {
      room_id: defaultRoomId || '',
      total_price: 0,
    },
    mode: 'onChange', // Валидация при изменении поля
  });

  /**
   * Отслеживание изменений полей для пересчета стоимости
   */
  const watchedValues = watch();

  /**
   * Пересчет общей стоимости на основе выбранных параметров
   */
  React.useEffect(() => {
    if (!watchedValues.room_id || !watchedValues.start_time || !watchedValues.end_time) return;

    // Найти выбранную комнату
    const selectedRoom = availableRooms.find(room => room.id === watchedValues.room_id);
    
    if (selectedRoom && selectedRoom.hourly_rate) {
      try {
        // Парсим время и вычисляем разницу в часах
        const startHour = parseInt(watchedValues.start_time.substring(0, 2), 10);
        const endHour = parseInt(watchedValues.end_time.substring(0, 2), 10);

        let hoursDifference = endHour - startHour;
        
        // Корректировка если переход через полдень/полночь
        if (hoursDifference <= 0) {
          hoursDifference += 24;
        }

        // Минимум 1 час
        const billableHours = Math.max(1, hoursDifference);
        
        // Вычисляем стоимость
        setValue('total_price', billableHours * selectedRoom.hourly_rate);
      } catch (error) {
        console.error('Ошибка расчета стоимости:', error);
        setValue('total_price', 0);
      }
    } else if (!selectedRoom && availableRooms.length > 0) {
      // Если комната не найдена, используем дефолтную стоимость
      const startHour = parseInt(watchedValues.start_time.substring(0, 2), 10);
      const endHour = parseInt(watchedValues.end_time.substring(0, 2), 10);

      let hoursDifference = endHour - startHour;
      if (hoursDifference <= 0) {
        hoursDifference += 24;
      }
      
      setValue('total_price', Math.max(1, hoursDifference) * 5000); // Дефолтная ставка 5000/час
    } else {
      setValue('total_price', 0);
    }
  }, [watchedValues.room_id, watchedValues.start_time, watchedValues.end_time, availableRooms, setValue]);

  /**
   * Обработчик успешной отправки формы
   */
  const onSubmit = async (data: CreateOrderRequest) => {
    try {
      // Валидация данных через Zod перед отправкой
      const validatedData = CreateOrderRequestSchema.parse(data);

      console.log('Отправка заказа:', validatedData);

      // TODO: Вызов мутации для создания заказа через API
      // await createOrder.mutateAsync(validatedData);
      
      // Имитация успешного запроса (удалить после интеграции с бэкендом)
      setTimeout(() => {
        toast.success('Бронирование успешно создано', {
          duration: 5000,
          icon: '✅',
        });

        // Перенаправление на страницу заказов
        navigate('/orders');
        
        // Сброс формы
        reset();
      }, 1000);

    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Ошибка валидации: ${error.message}`);
        console.error('Validation error:', error);
      } else {
        toast.error('Ошибка при создании бронирования. Попробуйте позже.');
        console.error('Error creating order:', error);
      }
    }
  };

  /**
   * Обработчик выбора комнаты (автоматически устанавливает hourly_rate если есть)
   */
  const handleRoomChange = (roomId: string) => {
    setValue('room_id', roomId);
    
    // Если комната имеет hourly_rate, можно автоматически установить стоимость
    const selectedRoom = availableRooms.find(room => room.id === roomId);
    if (selectedRoom && selectedRoom.hourly_rate) {
      console.log(`Выбрана комната: ${selectedRoom.name}, ставка: ${selectedRoom.hourly_rate}/час`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Заголовок страницы */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Оформление бронирования</h1>
        <p className="text-gray-600">Заполните форму для бронирования фотостудии</p>
      </div>

      {/* Форма бронирования */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        {/* Выбор комнаты/зала */}
        <div>
          <label htmlFor="room_id" className="block text-sm font-semibold text-gray-700 mb-2">
            Комната/Зал *
          </label>
          <select
            id="room_id"
            {...register('room_id', { required: 'Выберите комнату' })}
            onChange={(e) => handleRoomChange(e.target.value)}
            className={`w-full px-4 py-3 border ${errors.room_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white`}
          >
            <option value="">Выберите комнату</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} - {(room.hourly_rate || 0).toLocaleString('ru-RU')} ₽/час
              </option>
            ))}
          </select>
          {errors.room_id && (
            <p className="mt-1 text-sm text-red-600">{errors.room_id.message}</p>
          )}
        </div>

        {/* Дата бронирования */}
        <div>
          <label htmlFor="booking_date" className="block text-sm font-semibold text-gray-700 mb-2">
            Дата бронирования *
          </label>
          <input
            type="date"
            id="booking_date"
            {...register('start_time', { required: 'Выберите дату' })} // Используем start_time для даты
            min={format(new Date(), 'yyyy-MM-dd')}
            className={`w-full px-4 py-3 border ${errors.start_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>

        {/* Время начала */}
        <div>
          <label htmlFor="start_time" className="block text-sm font-semibold text-gray-700 mb-2">
            Время начала *
          </label>
          <input
            type="time"
            id="start_time"
            {...register('start_time', { 
              required: 'Укажите время начала',
              validate: (value) => {
                if (!value) return 'Время обязательно';
                const [hours, minutes] = value.split(':').map(Number);
                if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                  return 'Некорректное время';
                }
                return true;
              }
            })}
            className={`w-full px-4 py-3 border ${errors.start_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          />
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
          )}
        </div>

        {/* Время окончания */}
        <div>
          <label htmlFor="end_time" className="block text-sm font-semibold text-gray-700 mb-2">
            Время окончания *
          </label>
          <input
            type="time"
            id="end_time"
            {...register('end_time', { 
              required: 'Укажите время окончания',
              validate: (value) => {
                if (!value) return 'Время обязательно';
                const [hours, minutes] = value.split(':').map(Number);
                if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                  return 'Некорректное время';
                }
                return true;
              }
            })}
            className={`w-full px-4 py-3 border ${errors.end_time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          />
          {errors.end_time && (
            <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
          )}
        </div>

        {/* Итоговая стоимость */}
        <div className={`bg-blue-50 rounded-lg p-4 transition-all ${showPriceSummary ? 'ring-2 ring-blue-500' : ''}`}>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowPriceSummary(!showPriceSummary)}
          >
            <h3 className="text-lg font-semibold text-gray-900">Итоговая стоимость</h3>
            <svg 
              className={`w-5 h-5 text-blue-600 transition-transform ${showPriceSummary ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showPriceSummary && (
            <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Сумма:</span>
                <span className="font-semibold">{watchedValues.total_price?.toLocaleString('ru-RU')} ₽</span>
              </div>
              {watchedValues.room_id && availableRooms.length > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Выбранная комната:</span>
                  <span className="font-semibold">
                    {availableRooms.find(r => r.id === watchedValues.room_id)?.name || 'Неизвестно'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Контактные данные */}
        <h3 className="text-lg font-semibold text-gray-900 pt-4 border-t">Контактные данные</h3>

        {/* Имя клиента */}
        <div>
          <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя (опционально)
          </label>
          <input
            type="text"
            id="customer_name"
            {...register('customer_name')}
            placeholder="Иван Иванов"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (опционально)
          </label>
          <input
            type="email"
            id="customer_email"
            {...register('customer_email')}
            placeholder="ivan@example.com"
            className={`w-full px-4 py-3 border ${errors.customer_email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
          />
          {errors.customer_email && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_email.message}</p>
          )}
        </div>

        {/* Телефон */}
        <div>
          <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Телефон (опционально)
          </label>
          <input
            type="tel"
            id="customer_phone"
            {...register('customer_phone')}
            placeholder="+7 (999) 123-45-67"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Примечание */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Примечание (опционально)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder="Дополнительные пожелания или комментарии..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            Очистить форму
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Отправка...
              </>
            ) : (
              'Подтвердить бронирование'
            )}
          </button>
        </div>

        {/* Инфо о валидации */}
        <p className="text-xs text-gray-500 text-center">
          * Обязательные поля. После подтверждения вы получите уведомление на email (если указан).
        </p>
      </form>

      {/* Подсказка */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-yellow-700">
            После подтверждения бронирования администрация свяжется с вами для уточнения деталей.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
