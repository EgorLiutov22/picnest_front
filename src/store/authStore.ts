import { create } from 'zustand';
import type { User } from '../types/auth';
import tokenManager from '../lib/axios';

/**
 * Интерфейс состояния аутентификации
 */
interface AuthState {
  /** Профиль пользователя */
  user: User | null;
  /** Статус авторизации */
  isAuthenticated: boolean;
  /** Загружается ли информация о пользователе */
  isLoading: boolean;

  /**
   * Устанавливает состояние аутентификации
   * @param userData - Профиль пользователя
   * @param token - Access токен (опционально)
   */
  setAuth: (userData: User, token?: string) => void;

  /**
   * Обновляет информацию о пользователе
   * @param updates - Частичные обновления профиля пользователя
   */
  updateUser: (updates: Partial<User>) => void;

  /**
   * Сбрасывает состояние аутентификации
   * Очищает токены и перенаправляет на страницу входа
   */
  logout: () => void;

  /**
   * Устанавливает флаг загрузки информации о пользователе
   * @param isLoading - Статус загрузки
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Проверяет соответствие роли пользователя требуемой роли
   * @param requiredRole - Требуемая роль для доступа к ресурсу
   * @returns true если пользователь имеет нужную роль или является админом
   */
  hasRequiredRole: (requiredRole: User['role']) => boolean;
}

/**
 * Создает стор Zustand для управления состоянием аутентификации
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (userData, token) => {
    // Сохраняем токен в localStorage если он передан
    if (token) {
      tokenManager.setTokens(token);
    }

    set({
      user: userData,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates },
      });
    }
  },

  logout: () => {
    // Очищаем токены через tokenManager
    tokenManager.clearTokens();

    // Сбрасываем состояние стор
    set({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    // Перенаправляем на страницу входа
    window.location.href = '/login';
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  hasRequiredRole: (requiredRole) => {
    const { user } = get();

    // Админ имеет доступ ко всем ресурсам
    if (user?.role === 'admin') {
      return true;
    }

    // Проверяем соответствие роли
    return user?.role === requiredRole;
  },
}));

/**
 * Хук для получения состояния аутентификации
 */
export const useAuth = () => {
  const store = useAuthStore();

  return {
    ...store,
    /** Текущая роль пользователя (undefined если не авторизован) */
    role: store.user?.role,
    /** Email пользователя (undefined если не авторизован) */
    email: store.user?.email,
    /** Имя пользователя (undefined если не авторизован) */
    name: store.user?.name,
  };
};

/**
 * Хук для проверки доступа к ресурсу по роли
 * @param requiredRole - Требуемая роль
 * @returns boolean - true если пользователь имеет доступ
 */
export const useCanAccess = (requiredRole?: User['role']) => {
  const store = useAuthStore();

  if (!store.isAuthenticated || !requiredRole) {
    return false;
  }

  return store.hasRequiredRole(requiredRole);
};
