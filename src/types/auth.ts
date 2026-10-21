import { z } from 'zod';

/**
 * Типы данных для модуля аутентификации
 */

/**
 * Роли пользователей в системе
 */
export type UserRole = 'photographer' | 'studio' | 'admin';

/**
 * Схема валидации роли пользователя (Zod)
 */
export const UserRoleSchema: z.ZodEnum<[UserRole, ...UserRole[]]> = z.enum([
  'photographer',
  'studio',
  'admin',
]);

/**
 * Интерфейс профиля пользователя
 * Зеркально отражает Pydantic модель User в бэкенде
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Схема валидации профиля пользователя (Zod)
 */
export const UserSchema: z.ZodType<User> = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  avatar_url: z.string().url().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Интерфейс запроса для регистрации
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

/**
 * Схема валидации запроса на регистрацию (Zod)
 */
export const RegisterRequestSchema: z.ZodType<RegisterRequest> = z.object({
  email: z.string().email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
  name: z.string().min(1, 'Имя обязательно для заполнения'),
  role: UserRoleSchema,
});

/**
 * Интерфейс запроса для входа в систему
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Схема валидации запроса на вход (Zod)
 */
export const LoginRequestSchema: z.ZodType<LoginRequest> = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен для заполнения'),
});

/**
 * Интерфейс ответа от сервера после успешной авторизации
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

/**
 * Схема валидации ответа от сервера (Zod)
 */
export const AuthResponseSchema: z.ZodType<AuthResponse> = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal('Bearer'),
});

/**
 * Интерфейс запроса для обновления токена
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * Схема валидации запроса на обновление токена (Zod)
 */
export const RefreshTokenRequestSchema: z.ZodType<RefreshTokenRequest> = z.object({
  refresh_token: z.string(),
});

/**
 * Тип для ошибок валидации формы регистрации
 */
export interface RegistrationErrors {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
}

/**
 * Тип для ошибок валидации формы входа
 */
export interface LoginErrors {
  email?: string;
  password?: string;
  general?: string; // Ошибка от сервера при неверных учетных данных
}
