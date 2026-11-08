import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { login, register } from '../services/auth';
import type { UserRole } from '../types/auth';

/**
 * Каркас страниц авторизации: форма слева, фото справа — в стиле лендинга.
 */
const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-6 py-8 md:px-12">
      <Logo />
      <div className="mx-auto w-full max-w-[440px] py-12 lg:my-auto">
        <h1 className="text-[32px] font-bold leading-[1.1] tracking-tighter2 text-ink">{title}</h1>
        <p className="mt-3 text-base leading-[1.55] text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
    <div className="relative hidden overflow-hidden bg-ink lg:sticky lg:top-0 lg:block lg:h-screen">
      <img src="/img/hero/hero-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-12">
        <span className="pill bg-white/15 text-white">Фотографы · Видеографы · Фотостудии</span>
        <p className="mt-4 max-w-[440px] text-[28px] font-bold leading-[1.15] tracking-tighter2 text-white">
          Бронируйте съёмку онлайн — без звонков и переписки
        </p>
      </div>
    </div>
  </div>
);

const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-5 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {message}
  </div>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ProtectedRoute кладёт сюда путь, с которого пользователя отправили на вход
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/orders';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login({ username: email, password });
      setAuth(user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Вход в PicNest" subtitle="Войдите, чтобы управлять своими бронированиями.">
      {error && <ErrorBox message={error} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </AuthShell>
  );
};

const ROLE_OPTIONS: Array<{ value: UserRole; title: string; text: string }> = [
  { value: 'client', title: 'Клиент', text: 'Бронирую съёмки' },
  { value: 'photographer', title: 'Фотограф', text: 'Принимаю заказы' },
  { value: 'studio', title: 'Студия', text: 'Сдаю залы' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const initialRole = (ROLE_OPTIONS.find((r) => r.value === params.get('role'))?.value ?? 'client') as UserRole;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await register({ email, password, first_name: firstName, last_name: lastName, role });
      setAuth(user);
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Создать аккаунт" subtitle="Регистрация займёт меньше минуты.">
      {error && <ErrorBox message={error} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset>
          <legend className="field-label">Кто вы?</legend>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                aria-pressed={role === r.value}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  role === r.value
                    ? 'border-brand bg-brand-soft'
                    : 'border-line bg-white hover:border-brand/40'
                }`}
              >
                <span className={`block text-sm font-semibold ${role === r.value ? 'text-brand' : 'text-ink'}`}>
                  {r.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted">{r.text}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first_name" className="field-label">
              Имя
            </label>
            <input
              id="first_name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="field"
              placeholder="Иван"
            />
          </div>
          <div>
            <label htmlFor="last_name" className="field-label">
              Фамилия
            </label>
            <input
              id="last_name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="field"
              placeholder="Иванов"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg_email" className="field-label">
            Email
          </label>
          <input
            id="reg_email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label htmlFor="reg_password" className="field-label">
            Пароль
          </label>
          <input
            id="reg_password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="Минимум 8 символов"
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Регистрация…' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Войти
        </Link>
      </p>
    </AuthShell>
  );
};
