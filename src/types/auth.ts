import { z } from 'zod';

/**
 * Типы данных для модуля аутентификации.
 * Структуры повторяют Pydantic-схемы бэкенда (app/schemas/user.py).
 */

/**
 * Роли пользователей в системе (совпадают с бэкендом).
 */
export const UserRoleSchema = z.enum(['client', 'photographer', 'studio']);

export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Профиль пользователя — соответствует UserResponse бэкенда.
 * Тип выводится из схемы, чтобы не расходиться с ней.
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  status: z.string(),
  city: z.string().nullable(),
  timezone: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * Запрос на регистрацию — соответствует UserCreate бэкенда.
 */
export const RegisterRequestSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(72, 'Пароль должен быть не длиннее 72 символов'),
  first_name: z.string().min(1, 'Имя обязательно для заполнения'),
  last_name: z.string().min(1, 'Фамилия обязательна для заполнения'),
  role: UserRoleSchema,
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * Запрос на вход.
 * Бэкенд принимает и JSON, и form-urlencoded; поле называется username.
 */
export const LoginRequestSchema = z.object({
  username: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен для заполнения'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Ответ сервера после успешной авторизации.
 */
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/**
 * Запрос на обновление токена.
 */
export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Ошибки валидации формы регистрации.
 */
export interface RegistrationErrors {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  detail?: string;
}

/**
 * Ошибки валидации формы входа.
 */
export interface LoginErrors {
  general?: string;
  username?: string;
  email?: string;
  password?: string;
  detail?: string;
}
