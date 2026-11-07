import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Компоненты страниц (заглушки)
const HomePage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Добро пожаловать в PicNest!</h1>
    <p className="text-gray-600">Маркетплейс фотостудий и фотографов</p>
  </div>
);

const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Вход в систему</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="user@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Войти
        </button>
      </form>
    </div>
  </div>
);

const RegisterPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Регистрация</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Иван Иванов"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="user@example.com"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Роль
          </label>
          <select
            id="role"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          >
            <option value="client">Клиент</option>
            <option value="photographer">Фотограф</option>
            <option value="studio">Студия</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Панель управления</h1>
    <p className="text-gray-600 mb-6">Добро пожаловать в панель управления!</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-600">Статистика</h2>
        <p className="text-gray-700">Здесь будет ваша статистика</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2 text-green-600">Задачи</h2>
        <p className="text-gray-700">Список ваших задач</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2 text-purple-600">Настройки</h2>
        <p className="text-gray-700">Конфигурация профиля</p>
      </div>
    </div>
  </div>
);

const StudioDashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4 text-green-700">Управление студией</h1>
    <p className="text-gray-600 mb-6">Только для владельцев студий и администраторов</p>
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-green-600">Статистика студии</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Количество бронирований: 150</li>
        <li>Средняя оценка: 4.8/5.0</li>
        <li>Активные фотографы: 25</li>
      </ul>
    </div>
  </div>
);

// Импортируем компоненты из модуля заказов
import { OrdersPage } from './features/orders/OrdersPage';
import { BookingForm } from './features/orders/BookingForm';

// Импортируем компонент ScheduleManager (расписание)
import { ScheduleManager } from './features/schedule/ScheduleManager';

/**
 * Список доступных комнат для тестирования
 */
const AVAILABLE_ROOMS = [
  { id: 'room-1', name: 'Студия "Свет"', hourly_rate: 3000 },
  { id: 'room-2', name: 'Студия "Творчество"', hourly_rate: 4500 },
  { id: 'room-3', name: 'Зал для мероприятий', hourly_rate: 6000 },
];

// Конфигурация QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут
      retry: 1,
    },
  },
});

/**
 * Основной компонент приложения
 */
function App() {
  const { isAuthenticated } = useAuthStore();

  /**
   * Эффект для автоматической проверки авторизации при загрузке приложения
   */
  useEffect(() => {
    // Здесь можно добавить логику предварительной загрузки пользователя
    console.log('Приложение загружено, статус авторизации:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищённый маршрут /dashboard для всех авторизованных пользователей */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Страница списка заказов - доступна всем авторизованным */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage availableRooms={AVAILABLE_ROOMS} />
              </ProtectedRoute>
            }
          />

          {/* Форма бронирования - доступна всем авторизованным */}
          <Route
            path="/studio/book"
            element={
              <ProtectedRoute>
                <BookingForm availableRooms={AVAILABLE_ROOMS} defaultRoomId="room-1" />
              </ProtectedRoute>
            }
          />

          {/* Защищённый маршрут только для ролей 'studio' и 'admin' - Расписание студии */}
          <Route
            path="/studio/schedule/*"
            element={
              <ProtectedRoute requiredRole="studio">
                <ScheduleManager />
              </ProtectedRoute>
            }
          />

          {/* Защищённый маршрут только для ролей 'studio' и 'admin' */}
          <Route
            path="/studio/*"
            element={
              <ProtectedRoute requiredRole="studio">
                <StudioDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Маршрут с явной проверкой роли (если requiredRole не совпадает, рендерит Unauthorized) */}
          <Route path="/photographer/*" element={<PhotographerRoute />} />

          {/* 404 - страница не найдена */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Отдельный роут для фотографов с явной проверкой роли
 */
const PhotographerRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Фотографы имеют отдельную панель управления
  if (role === 'photographer') {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-orange-700">Панель фотографа</h1>
        <p className="text-gray-600 mb-6">Добро пожаловать, коллега!</p>
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Ваш профиль</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Количество бронирований: 45</li>
            <li>Средняя оценка: 4.9/5.0</li>
            <li>Отзывов: 38</li>
          </ul>
        </div>
      </div>
    );
  }

  // Если пользователь не фотограф, показываем ошибку доступа
  return (
    <Navigate to="/unauthorized" replace />
  );
};

export default App;
