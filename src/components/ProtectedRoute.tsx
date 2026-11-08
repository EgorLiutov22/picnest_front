import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth';
import { getCurrentUser } from '../services/auth';

/**
 * Типы пропсов для компонента ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Требуемая роль пользователя для доступа к защищённому маршруту (опционально) */
  requiredRole?: User['role'];
  /** Компонент, который рендерится если пользователь авторизован и имеет нужную роль */
  children?: React.ReactNode;
}

/**
 * Компонент защиты маршрутов с RBAC (Role-Based Access Control)
 *
 * Проверяет:
 * 1. Авторизацию пользователя
 * 2. Соответствие роли пользователя требуемой роли (если задана requiredRole)
 *
 * @example
 * // Защищённый маршрут для всех авторизованных пользователей
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Защищённый маршрут только для фотографов
 * <ProtectedRoute requiredRole="photographer">
 *   <PhotographerDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Защищённый маршрут только для студий и админов
 * <ProtectedRoute requiredRole="studio">
 *   <StudioManagement />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const { isAuthenticated, isLoading, user, setAuth, setLoading } = useAuthStore();

  /**
   * Эффект для проверки авторизации при монтировании компонента
   */
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        // Если пользователь уже аутентифицирован в стор, не делаем повторный запрос
        if (isAuthenticated && user) {
          setLoading(false);
          setIsChecking(false);
          return;
        }

        // Пытаемся получить актуальную информацию о пользователе
        const currentUser = await getCurrentUser();
        
        // Обновляем состояние стор с данными пользователя
        setAuth(currentUser);
      } catch (error) {
        console.warn('Проверка авторизации не удалась:', error);
        // Оставляем isAuthenticated = false, чтобы перенаправить на login
      } finally {
        setLoading(false);
        setIsChecking(false);
      }
    };

    checkAuthorization();
  }, [isAuthenticated, user, setAuth, setLoading]);

  /**
   * Проверка соответствия роли пользователя требуемой роли (RBAC)
   */
  const hasRequiredRole = () => {
    // Если requiredRole не задана, проверяем только авторизацию
    if (!requiredRole) {
      return true;
    }

    // Проверяем точное соответствие роли
    return user?.role === requiredRole;
  };

  /**
   * Во время проверки авторизации показываем лоадер или ничего не рендерим
   */
  if (isLoading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-surface">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-soft border-t-brand" />
        <span className="text-muted">Загрузка…</span>
      </div>
    );
  }

  // Если пользователь не авторизован — перенаправляем на login
  if (!isAuthenticated || !user) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  // Если requiredRole задана, проверяем соответствие роли пользователя
  if (!hasRequiredRole()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-[28px] font-bold tracking-tighter2 text-ink">Доступ запрещён</h1>
          <p className="mt-3 text-muted">У вас нет прав для доступа к этой странице.</p>
          <button type="button" onClick={() => (window.location.href = '/')} className="btn-primary mt-6">
            На главную
          </button>
        </div>
      </div>
    );
  }

  // Пользователь авторизован и имеет нужную роль — рендерим контент
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
