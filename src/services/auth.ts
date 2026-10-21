import { z } from 'zod';
import apiClient from '../lib/axios';
import tokenManager from '../lib/axios';
import type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  RegistrationErrors,
  LoginErrors,
} from '../types/auth';
import {
  UserSchema,
  RegisterRequestSchema,
  LoginRequestSchema,
  AuthResponseSchema,
  RefreshTokenRequestSchema,
} from '../types/auth';

/**
 * Сервис аутентификации
 * Предоставляет функции для работы с API авторизации
 */

/**
 * Регистрация нового пользователя
 * @param data - Данные для регистрации (email, password, name, role)
 * @throws {Error} Если валидация данных не прошла или на сервере ошибка
 * @returns Promise<User> - Профиль созданного пользователя
 */
export const register = async (data: RegisterRequest): Promise<User> => {
  // Валидация входных данных с помощью Zod
  const validatedData = RegisterRequestSchema.parse(data);

  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', validatedData);

    // Сохраняем токены после успешной регистрации
    tokenManager.setTokens(response.data.access_token, response.data.refresh_token);

    // Получаем профиль пользователя
    return getCurrentUser();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Ошибка валидации данных: ' + error.message);
    }

    const axiosError = error as { response?: { data?: RegistrationErrors; status?: number } };
    const serverErrors = axiosError.response?.data as RegistrationErrors | undefined;

    if (serverErrors) {
      throw new Error(
        Object.values(serverErrors)
          .filter(Boolean)
          .join('\n') || 'Ошибка регистрации'
      );
    }

    throw new Error('Ошибка при регистрации. Попробуйте позже');
  }
};

/**
 * Вход в систему (авторизация)
 * @param credentials - Учетные данные для входа (email, password)
 * @throws {Error} Если учетные данные неверны или на сервере ошибка
 * @returns Promise<User> - Профиль пользователя
 */
export const login = async (credentials: LoginRequest): Promise<User> => {
  // Валидация входных данных с помощью Zod
  const validatedData = LoginRequestSchema.parse(credentials);

  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', validatedData);

    // Сохраняем токены после успешного входа
    tokenManager.setTokens(response.data.access_token, response.data.refresh_token);

    // Получаем профиль пользователя
    return getCurrentUser();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Ошибка валидации данных: ' + error.message);
    }

    const axiosError = error as { response?: { data?: LoginErrors; status?: number } };
    const serverErrors = axiosError.response?.data as LoginErrors | undefined;

    // Обработка ошибок от сервера (например, неверный email или пароль)
    if (serverErrors?.general) {
      throw new Error(serverErrors.general);
    }

    if (serverErrors?.email || serverErrors?.password) {
      throw new Error(
        [serverErrors.email, serverErrors.password]
          .filter(Boolean)
          .join('\n') || 'Ошибка входа'
      );
    }

    throw new Error('Ошибка при входе. Попробуйте позже');
  }
};

/**
 * Обновление токена доступа через refresh токен
 * @param refreshToken - Refresh token для обновления
 * @throws {Error} Если refresh токен невалиден или на сервере ошибка
 * @returns Promise<boolean> - true при успешном обновлении
 */
export const refreshToken = async (refreshToken: string): Promise<boolean> => {
  try {
    // Валидация входных данных с помощью Zod
    const validatedData = RefreshTokenRequestSchema.parse({ refresh_token: refreshToken });

    const response = await apiClient.post<AuthResponse>('/auth/refresh', validatedData);

    // Обновляем токены в хранилище
    tokenManager.setTokens(response.data.access_token, response.data.refresh_token);

    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Ошибка валидации refresh токена');
    }

    const axiosError = error as { response?: { status?: number }; data?: unknown };

    // Если статус 401, токен устарел и требуется повторный вход
    if (axiosError.response?.status === 401) {
      tokenManager.clearTokens();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова');
    }

    throw new Error('Ошибка при обновлении токена. Попробуйте позже');
  }
};

/**
 * Получение текущего профиля пользователя
 * @throws {Error} Если пользователь не авторизован или на сервере ошибка
 * @returns Promise<User> - Профиль пользователя
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<AuthResponse & { user: User }>('/auth/users/me');

    // Извлекаем данные пользователя из ответа (в зависимости от структуры API)
    // TODO: уточнить тип ответа - может быть просто User или объект с токенами
    const userData = (response.data as any).user || response.data;

    // Валидация данных с помощью Zod
    return UserSchema.parse(userData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Ошибка валидации данных пользователя');
    }

    const axiosError = error as { response?: { status?: number } };

    // Если пользователь не авторизован
    if (axiosError.response?.status === 401) {
      tokenManager.clearTokens();
      throw new Error('Пользователь не авторизован');
    }

    throw new Error('Ошибка при получении профиля пользователя');
  }
};

/**
 * Выход из системы
 * Очищает токены и перенаправляет на страницу входа
 */
export const logout = (): void => {
  tokenManager.clearTokens();
  // Перенаправление на страницу логина
  window.location.href = '/login';
};

/**
 * Проверка авторизации пользователя
 * @returns boolean - true если пользователь авторизован
 */
export const isAuthenticated = (): boolean => {
  return tokenManager.isAuthenticated();
};
