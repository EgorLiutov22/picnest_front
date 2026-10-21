import React, { useState } from 'react';
import { useSchedule } from '../../hooks/useSchedule';
import { MonthNavigation } from './MonthNavigation';
import { ScheduleCalendar } from './ScheduleCalendar';
import { ScheduleList } from './ScheduleList';

/**
 * Компонент управления расписанием фотостудии
 * Объединяет календарь, навигацию и список исключений/блокировок
 */
export const ScheduleManager: React.FC = () => {
  // Текущая дата для выбора месяца
  const [currentDate] = useState(new Date());
  
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  /**
   * Обработчик изменения месяца через навигацию
   */
  const handleMonthChange = (year: number, month: number) => {
    console.log('Переключение месяца:', year, month);
    // TODO: Можно добавить состояние для ручного выбора месяца
  };

  /**
   * Обработчик клика на день в календаре
   */
  const handleDayClick = (date: Date) => {
    console.log('Выбран день:', date);
    // Здесь можно открыть модальное окно или выполнить другое действие
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Заголовок страницы */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Расписание фотостудии</h1>
        <p className="text-gray-600 mt-2">Управление рабочим временем, выходными и блокировками</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Календарь */}
        <div className="lg:col-span-2">
          <MonthNavigation
            currentYear={currentYear}
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
          />

          <ScheduleCalendar
            currentYear={currentYear}
            currentMonth={currentMonth}
            exceptions={[]} // TODO: Загрузить из useSchedule
            blocks={[]}     // TODO: Загрузить из useSchedule
            onDayClick={handleDayClick}
          />
        </div>

        {/* Правая колонка - Список исключений и блокировок */}
        <div className="lg:col-span-1">
          <ScheduleList
            exceptions={[]} // TODO: Загрузить из useSchedule
            blocks={[]}     // TODO: Загрузить из useSchedule
            onRemoveException={(id) => console.log('Удаление исключения:', id)}
            onRemoveBlock={(id) => console.log('Разблокировка слота:', id)}
          />
        </div>
      </div>

      {/* Информация о статусе загрузки */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Статус загрузки:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentMonth ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-600">Календарь</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentMonth ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-600">Исключения</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentMonth ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-600">Блокировки</span>
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Нажмите на любой день в календаре, чтобы добавить исключение или заблокировать слот. 
              Зеленые дни — рабочие, красные — выходные, желтые — кастомное время, серые — заблокировано.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;
