import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Знак PicNest: фиолетовый квадрат с «объективом», как на лендинге.
 */
export const LogoMark: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <span
    className="relative inline-flex shrink-0 items-start justify-center rounded-xl bg-brand"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <span
      className="absolute rounded-full border-2 border-white p-1"
      style={{ top: size * 0.14, left: size * 0.26, width: size * 0.48, height: size * 0.48 }}
    >
      <span className="block h-full w-full rounded-full border-2 border-white" />
    </span>
    <img
      src="/img/logo-mark.png"
      alt=""
      className="absolute"
      style={{ top: size * 0.52, left: size * 0.14, width: size * 0.69 }}
    />
  </span>
);

export const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-3 text-[28px] font-bold tracking-[-1px] text-ink">
    <LogoMark />
    PicNest
  </Link>
);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-[15px] font-medium transition ${isActive ? 'text-brand' : 'text-ink hover:text-brand'}`;

export const SiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email;

  return (
    <header className="border-b border-line bg-white">
      <div className="container-pn flex items-center justify-between gap-6 py-5">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Главная
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={navLinkClass}>
              Мои бронирования
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted lg:inline">{displayName}</span>
              <button type="button" onClick={logout} className="btn-secondary px-4 py-2.5">
                Выйти
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-secondary px-4 py-2.5"
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="btn-primary hidden px-4 py-2.5 sm:inline-flex"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export const SiteFooter: React.FC = () => (
  <footer className="mt-auto border-t border-line bg-white">
    <div className="container-pn flex flex-col items-center gap-4 py-16 text-center">
      <Logo />
      <p className="max-w-[530px] text-[15px] leading-[1.55] text-muted">
        Маркетплейс фотографов, видеографов и фотостудий. Бронируйте съёмку онлайн —
        без звонков и лишней переписки.
      </p>
      <p className="text-sm text-muted">© {new Date().getFullYear()} PicNest</p>
    </div>
  </footer>
);

/**
 * Общий каркас страницы: шапка, содержимое, подвал.
 */
export const PageLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <>
    <SiteHeader />
    <main className={`flex-1 ${className}`}>{children}</main>
    <SiteFooter />
  </>
);

export default PageLayout;
