import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Создает и настраивает экземпляр Axios с интерсепторами для авторизации
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Хранилище токенов и конфигурация повторных запросов
 */
interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  isRefreshing: boolean;
  failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }>;
}

const tokenState: TokenState = {
  accessToken: null,
  refreshToken: null,
  isRefreshing: false,
  failedQueue: [],
};

/**
 * Обработка успешного ответа - сохранение токенов и добавление Authorization заголовка
 */
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен доступа к запросу, если он есть
    if (tokenState.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokenState.accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Интерсептор ответов для обработки ошибок и обновления токенов
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Обработка ошибки 401 - попытка обновления токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Если уже пытаемся обновить токен, добавляем запрос в очередь
      if (tokenState.isRefreshing) {
        return new Promise((resolve, reject) => {
          tokenState.failedQueue.push({ resolve, reject });
        }).then(() => {
          // После обновления токена повторяем запрос
          originalRequest._retry = true;
          return apiClient(originalRequest);
        }).catch((err) => {
          // Если обновление не удалось - выход из системы
          handleAuthError();
          return Promise.reject(err);
        });
      }

      tokenState.isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Пытаемся обновить токен через refreshToken
        const refreshResponse = await apiClient.post('/auth/refresh', {
          refresh_token: tokenState.refreshToken,
        });

        // Получаем новые токены из ответа
        const { access_token, refresh_token } = refreshResponse.data;

        // Обновляем состояние токенов
        tokenState.accessToken = access_token;
        tokenState.refreshToken = refresh_token || tokenState.refreshToken;

        // Повторяем исходный запрос с новым токеном
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если обновление не удалось - выходим из системы
        handleAuthError();
        return Promise.reject(refreshError);
      } finally {
        tokenState.isRefreshing = false;

        // Обрабатываем очередь повторных запросов
        while (tokenState.failedQueue.length > 0) {
          const { resolve, reject } = tokenState.failedQueue.shift()!;
          if (originalRequest._retry) {
            resolve(apiClient(originalRequest));
          } else {
            reject(handleAuthError());
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Обработка ошибок авторизации - очистка токенов и перенаправление на логин
 */
function handleAuthError(): never {
  tokenState.accessToken = null;
  tokenState.refreshToken = null;
  tokenState.isRefreshing = false;
  tokenState.failedQueue = [];

  // Очищаем localStorage при необходимости
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Перенаправление на страницу логина
  window.location.href = '/login';

  throw new Error('Authentication failed');
}

/**
 * Методы для управления токенами вручную (например, после успешного логина)
 */
export const tokenManager = {
  /** Сохраняют новые токены в состояние и localStorage */
  setTokens: (accessToken: string, refreshToken?: string) => {
    tokenState.accessToken = accessToken;
    tokenState.refreshToken = refreshToken ?? tokenState.refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  },

  /** Удаляют токены из состояния и localStorage */
  clearTokens: () => {
    tokenState.accessToken = null;
    tokenState.refreshToken = null;
    tokenState.isRefreshing = false;
    tokenState.failedQueue = [];

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /** Получают текущий токен доступа */
  getAccessToken: (): string | null => tokenState.accessToken,

  /** Проверяют наличие валидного токена */
  isAuthenticated: (): boolean => !!tokenState.accessToken,
};

// Загружаем токены из localStorage при инициализации
if (typeof window !== 'undefined') {
  const storedAccessToken = localStorage.getItem('accessToken');
  const storedRefreshToken = localStorage.getItem('refreshToken');

  if (storedAccessToken) {
    tokenState.accessToken = storedAccessToken;
  }
  if (storedRefreshToken) {
    tokenState.refreshToken = storedRefreshToken;
  }
}

export default apiClient;
