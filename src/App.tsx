import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { OrdersPage } from './features/orders/OrdersPage';
import type { StudioRoomOption } from './types/orders';

// Залы для формы бронирования.
// Эндпоинта списка залов в API пока нет — когда появится, эти данные
// будут загружаться запросом.
const AVAILABLE_ROOMS: StudioRoomOption[] = [
  { id: 1, name: 'Зал А', price_per_hour: '2000.00', studio_title: 'Тестовая студия' },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage availableRooms={AVAILABLE_ROOMS} />
              </ProtectedRoute>
            }
          />

          {/* Старые адреса из прошлой версии ведут в личный кабинет */}
          <Route path="/dashboard" element={<Navigate to="/orders" replace />} />
          <Route path="/studio/book" element={<Navigate to="/orders?new=1" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#211a32',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#5830a4', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
