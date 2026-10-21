import React from 'react';

/**
 * Интерфейс пропсов для компонента Modal
 */
interface ModalProps {
  /** Заголовок модального окна */
  title: string;
  /** Содержимое модального окна */
  children: React.ReactNode;
  /** Флаг видимости модалки */
  isOpen: boolean;
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** Размер модального окна (опционально) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Показывать ли затемнение фона */
  withOverlay?: boolean;
}

/**
 * Компонент модального окна
 * 
 * @example
 * ```tsx
 * <Modal title="Действие" isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <form>...</form>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  isOpen,
  onClose,
  size = 'md',
  withOverlay = true,
}) => {
  // Закрытие по Escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла body когда модалка открыта
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Затемнение фона */}
      {withOverlay && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        />
      )}

      {/* Модальное окно */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${sizeClasses[size]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
          </div>

          {/* Содержимое */}
          <div className="px-4 py-4 sm:p-6">{children}</div>

          {/* Кнопки действий */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
