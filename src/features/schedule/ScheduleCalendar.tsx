import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ScheduleException, ScheduleBlock, CalendarDayInfo } from '../../types/schedule';
import { STANDARD_TIME_SLOTS } from '../../types/schedule';
import { Modal } from '../../components/Modal';

/**
 * Ячейка дня календаря.
 * Модификаторы в v8 доступны только через хук useActiveModifiers,
 * поэтому статус дня вычисляется тем же способом, что и для подсветки.
 */
const CustomDay: React.FC<{
  date: Date;
  getDayStatus: (date: Date) => CalendarDayInfo;
}> = ({ date, getDayStatus }) => {
  const info = getDayStatus(date);

  return (
    <div className="flex flex-col items-center justify-center p-2 h-full">
      <span className="text-sm">{format(date, 'd')}</span>
      {info.status === 'regular' && info.isOpen && (
        <div className="text-xs">09:00 - 18:00</div>
      )}
    </div>
  );
};

/**
 * Интерфейс пропсов для компонента календаря расписания
 */
interface ScheduleCalendarProps {
  /** Текущий выбранный месяц (год, месяц) */
  currentYear: number;
  currentMonth: number;
  /** Список исключений в расписании */
  exceptions: ScheduleException[];
  /** Заблокированные слоты */
  blocks: ScheduleBlock[];
  /** Обработчик клика на день */
  onDayClick?: (date: Date) => void;
}

/**
 * Компонент календаря расписания фотостудии
 * Отображает рабочие дни, выходные и заблокированные слоты
 */
export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  currentYear,
  currentMonth,
  exceptions,
  blocks,
  onDayClick,
}) => {
  // Состояние для модального окна выбора действия
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [actionType, setActionType] = useState<'exception' | 'block' | null>(null);

  /**
   * Определяет статус дня на основе исключений и блокировок
   */
  const getDayStatus = (date: Date): CalendarDayInfo => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Проверяем исключения
    const exception = exceptions.find((ex) => ex.date === dateStr);
    if (exception) {
      return {
        date,
        status: exception.exception_type === 'closed' ? 'exception_closed' : 'exception_custom',
        openTime: exception.open_time,
        closeTime: exception.close_time,
        exceptionType: exception.exception_type,
        reason: exception.description || null,
      };
    }

    // Проверяем блокировки
    const block = blocks.find((b) => b.date === dateStr);
    if (block) {
      return {
        date,
        status: 'blocked',
        reason: block.reason || null,
      };
    }

    // Обычный рабочий день
    return {
      date,
      status: 'regular',
      isOpen: true,
    };
  };

  /**
   * Обработчик клика на день
   */
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    onDayClick?.(day);
  };

  /**
   * Закрывает модальные окна
   */
  const closeModal = () => {
    setSelectedDate(null);
    setActionType(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Заголовок календаря */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white">
        <h2 className="text-xl font-semibold">
          {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: ru })}
        </h2>
      </div>

      {/* Календарь */}
      <DayPicker
        mode="single"
        selected={selectedDate || undefined}
        onSelect={(day) => {
          if (day) handleDayClick(day);
        }}
        month={new Date(currentYear, currentMonth - 1)}
        locale={ru}
        modifiers={{
          regular: (date) => {
            const info = getDayStatus(date);
            return info.status === 'regular';
          },
          exception_closed: (date) => {
            const info = getDayStatus(date);
            return info.status === 'exception_closed';
          },
          exception_custom: (date) => {
            const info = getDayStatus(date);
            return info.status === 'exception_custom';
          },
          blocked: (date) => {
            const info = getDayStatus(date);
            return info.status === 'blocked';
          },
        }}
        modifiersStyles={{
          regular: {
            backgroundColor: '#dcfce7', // green-100
            color: '#166534', // green-800
            fontWeight: 'bold',
          },
          exception_closed: {
            backgroundColor: '#fee2e2', // red-100
            color: '#991b1b', // red-800
            fontWeight: 'bold',
          },
          exception_custom: {
            backgroundColor: '#fef3c7', // amber-100
            color: '#92400e', // amber-800
            fontWeight: 'bold',
          },
          blocked: {
            backgroundColor: '#d1d5db', // gray-300
            color: '#374151', // gray-700
            opacity: 0.6,
          },
        }}
        components={{
          // В react-day-picker v8 DayProps содержит только date и displayMonth:
          // модификаторы не передаются пропсом, их получают через useActiveModifiers.
          Day: ({ date }) => <CustomDay date={date} getDayStatus={getDayStatus} />,
        }}
      />

      {/* Легенда */}
      <div className="p-4 bg-gray-50 border-t">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Легенда:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <span className="w-4 h-4 rounded bg-green-100 mr-2"></span>
            <span className="text-gray-700">Рабочий день</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded bg-red-100 mr-2"></span>
            <span className="text-gray-700">Выходной</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded bg-amber-100 mr-2"></span>
            <span className="text-gray-700">Кастомное время</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded bg-gray-300 mr-2 opacity-60"></span>
            <span className="text-gray-700">Заблокировано</span>
          </div>
        </div>
      </div>

      {/* Модальное окно для выбора действия */}
      {selectedDate && actionType === 'exception' && (
        <ScheduleExceptionModal
          date={selectedDate}
          onClose={closeModal}
          onSuccess={() => closeModal()}
        />
      )}

      {selectedDate && actionType === 'block' && (
        <ScheduleBlockModal
          date={selectedDate}
          onClose={closeModal}
          onSuccess={() => closeModal()}
        />
      )}
    </div>
  );
};

/**
 * Модальное окно для добавления исключения
 */
interface ScheduleExceptionModalProps {
  date: Date;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleExceptionModal: React.FC<ScheduleExceptionModalProps> = ({ 
  date, 
  onClose,
  onSuccess
}) => {
  const [exceptionType, setExceptionType] = useState<'closed' | 'custom'>('closed');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [description, setDescription] = useState('');

  return (
    <Modal title={`Добавить исключение на ${format(date, 'dd.MM.yyyy')}`} isOpen={true} onClose={onClose}>
      <div className="space-y-4">
        {/* Тип исключения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип исключения:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={exceptionType === 'closed'}
                onChange={() => setExceptionType('closed')}
                className="mr-2"
              />
              Выходной (студия не работает)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={exceptionType === 'custom'}
                onChange={() => setExceptionType('custom')}
                className="mr-2"
              />
              Кастомное время
            </label>
          </div>
        </div>

        {/* Время работы (только для custom типа) */}
        {exceptionType === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="openTime" className="block text-sm font-medium text-gray-700 mb-1">
                Время открытия:
              </label>
              <input
                type="time"
                id="openTime"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 mb-1">
                Время закрытия:
              </label>
              <input
                type="time"
                id="closeTime"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Описание (опционально):
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Например: Новый год, технический перерыв и т.д."
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              console.log('Создание исключения:', { date, exceptionType, openTime, closeTime, description });
              // TODO: Реализовать отправку POST запроса через useCreateException
              onSuccess();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Модальное окно для блокировки слота
 */
interface ScheduleBlockModalProps {
  date: Date;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleBlockModal: React.FC<ScheduleBlockModalProps> = ({ 
  date, 
  onClose,
  onSuccess
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('morning');
  const [reason, setReason] = useState('');

  return (
    <Modal title={`Блокировка слота на ${format(date, 'dd.MM.yyyy')}`} isOpen={true} onClose={onClose}>
      <div className="space-y-4">
        {/* Выбор временного слота */}
        <div>
          <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-2">
            Выберите слот для блокировки:
          </label>
          <select
            id="slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {STANDARD_TIME_SLOTS.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        {/* Причина блокировки */}
        <div>
          <label htmlFor="blockReason" className="block text-sm font-medium text-gray-700 mb-1">
            Причина (опционально):
          </label>
          <textarea
            id="blockReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Например: Технический день, праздник и т.д."
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              console.log('Блокировка слота:', { date, slotId: selectedSlot, reason });
              // TODO: Реализовать отправку POST запроса через useCreateBlock
              onSuccess();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Заблокировать
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleCalendar;
