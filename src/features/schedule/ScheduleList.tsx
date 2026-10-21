import React from 'react';
import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ScheduleException, ScheduleBlock } from '../../types/schedule';

/**
 * Интерфейс пропсов для компонента списка расписания
 */
interface ScheduleListProps {
  /** Список исключений */
  exceptions: ScheduleException[];
  /** Список блокировок */
  blocks: ScheduleBlock[];
  /** Обработчик клика на удаление исключения */
  onRemoveException?: (id: string) => void;
  /** Обработчик клика на разблокировку слота */
  onRemoveBlock?: (id: string) => void;
}

/**
 * Компонент списка исключений и блокировок расписания
 */
export const ScheduleList: React.FC<ScheduleListProps> = ({
  exceptions,
  blocks,
  onRemoveException,
  onRemoveBlock,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Заголовок */}
      <div className="bg-gray-800 px-4 py-3 text-white">
        <h2 className="text-xl font-semibold">Исключения и блокировки</h2>
      </div>

      {/* Список исключений */}
      {exceptions.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Исключения (выходные и кастомное время)
          </h3>
          <div className="space-y-2">
            {exceptions.map((exception) => (
              <ExceptionItem
                key={exception.id}
                exception={exception}
                onRemove={() => onRemoveException?.(exception.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Список блокировок */}
      {blocks.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            Заблокированные слоты
          </h3>
          <div className="space-y-2">
            {blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                onRemove={() => onRemoveBlock?.(block.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {exceptions.length === 0 && blocks.length === 0 && (
        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            В этом месяце нет исключений и блокировок
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент элемента исключения
 */
interface ExceptionItemProps {
  exception: ScheduleException;
  onRemove?: () => void;
}

const ExceptionItem: React.FC<ExceptionItemProps> = ({ exception, onRemove }) => {
  const dateFormatted = format(parse(exception.date, 'yyyy-MM-dd', new Date()), 'dd MMMM yyyy', {
    locale: ru,
  });

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
      <div>
        <div className="font-medium text-gray-900">{dateFormatted}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
          {exception.exception_type === 'closed' ? (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Выходной
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Кастомное время
              </span>
              {exception.open_time && exception.close_time ? (
                <span className="text-xs text-gray-600">
                  {exception.open_time} - {exception.close_time}
                </span>
              ) : null}
            </>
          )}
        </div>
        {exception.description && (
          <p className="text-xs text-gray-500 mt-1">{exception.description}</p>
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Удалить исключение"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Компонент элемента блокировки слота
 */
interface BlockItemProps {
  block: ScheduleBlock;
  onRemove?: () => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ block, onRemove }) => {
  const dateFormatted = format(parse(block.date, 'yyyy-MM-dd', new Date()), 'dd MMMM yyyy', {
    locale: ru,
  });

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
      <div>
        <div className="font-medium text-gray-900">{dateFormatted}</div>
        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">
            Заблокировано
          </span>
        </div>
        {block.reason && (
          <p className="text-xs text-gray-500 mt-1">{block.reason}</p>
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Разблокировать слот"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScheduleList;
