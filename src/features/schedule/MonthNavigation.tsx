import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Интерфейс пропсов для компонента навигации по месяцам
 */
interface MonthNavigationProps {
  /** Текущий выбранный год */
  currentYear: number;
  /** Текущий выбранный месяц (1-12) */
  currentMonth: number;
  /** Обработчик изменения месяца */
  onMonthChange?: (year: number, month: number) => void;
}

/**
 * Компонент навигации по месяцам для календаря расписания
 */
export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentYear,
  currentMonth,
  onMonthChange,
}) => {
  /**
   * Переход к предыдущему месяцу
   */
  const handlePrevious = () => {
    if (onMonthChange) {
      const prevDate = subMonths(new Date(currentYear, currentMonth - 1), 1);
      onMonthChange(prevDate.getFullYear(), prevDate.getMonth() + 1);
    }
  };

  /**
   * Переход к следующему месяцу
   */
  const handleNext = () => {
    if (onMonthChange) {
      const nextDate = addMonths(new Date(currentYear, currentMonth - 1), 1);
      onMonthChange(nextDate.getFullYear(), nextDate.getMonth() + 1);
    }
  };

  /**
   * Переход к текущему месяцу
   */
  const handleCurrentMonth = () => {
    if (onMonthChange) {
      const now = new Date();
      onMonthChange(now.getFullYear(), now.getMonth() + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Кнопка предыдущего месяца */}
        <button
          onClick={handlePrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Предыдущий месяц"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Текущий месяц */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy', { locale: ru })}
          </h3>
          <p className="text-sm text-gray-500">
            {currentYear}-{String(currentMonth).padStart(2, '0')}
          </p>
        </div>

        {/* Кнопка следующего месяца */}
        <button
          onClick={handleNext}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Следующий месяц"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Кнопка "Сегодня" */}
        {currentMonth !== new Date().getMonth() + 1 || currentYear !== new Date().getFullYear() && (
          <div className="ml-4">
            <button
              onClick={handleCurrentMonth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Сегодня
            </button>
          </div>
        )}
      </div>

      {/* Календарь на неделю для быстрого перехода */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
            <div key={index} className="text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthNavigation;
