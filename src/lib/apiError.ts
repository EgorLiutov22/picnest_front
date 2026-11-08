/**
 * Разбор ошибок API в понятный пользователю текст.
 *
 * Бэкенд отдаёт ошибки в формате
 *   { error_code, detail, errors?: [{ field, message }] }
 * Технические коды наружу не показываем.
 */

const KNOWN_CODES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже зарегистрирован',
  USER_INACTIVE: 'Аккаунт заблокирован или не активирован',
  RATE_LIMIT_EXCEEDED: 'Слишком много попыток. Подождите минуту и попробуйте снова',
  SLOT_ALREADY_BOOKED: 'Это время уже занято. Выберите другой слот',
  BOOKING_TOO_SOON: 'Бронировать нужно минимум за час до начала',
  DURATION_EXCEEDED: 'Максимальная длительность бронирования — 8 часов',
  CANCELLATION_TOO_LATE: 'Отменить с возвратом уже нельзя: до начала меньше суток',
};

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Пароль',
  first_name: 'Имя',
  last_name: 'Фамилия',
  role: 'Роль',
};

interface ApiErrorBody {
  error_code?: string;
  detail?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { status?: number; data?: ApiErrorBody }; message?: string };
  const data = err.response?.data;

  if (!err.response) {
    return 'Нет соединения с сервером. Проверьте интернет и попробуйте снова';
  }

  if (data?.error_code && KNOWN_CODES[data.error_code]) {
    return KNOWN_CODES[data.error_code];
  }

  if (data?.errors?.length) {
    return data.errors
      .map((e) => {
        const field = e.field?.split('.').pop() ?? '';
        const label = FIELD_LABELS[field];
        return label ? `${label}: ${e.message}` : e.message;
      })
      .filter(Boolean)
      .join('\n');
  }

  if (err.response.status && err.response.status >= 500) {
    return 'Сервер временно недоступен. Попробуйте позже';
  }

  return data?.detail || fallback;
}
