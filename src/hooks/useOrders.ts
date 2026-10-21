import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import type {
  Order,
  CreateOrderRequest,
  RoomAvailability,
} from '../types/orders';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Ключи для кэширования TanStack Query
 */
const ORDER_KEYS = {
  all: ['orders'] as const,
  list: () => [...ORDER_KEYS.all, 'list'] as const,
  details: (id: string) => [...ORDER_KEYS.all, id] as const,
  availability: (room_id: string, date: string) => 
    [...ORDER_KEYS.all, 'availability', room_id, date] as const,
} as const;

/**
 * Загружает список заказов для текущего пользователя/студии
 */
export const useOrdersList = () => {
  return useQuery<Order[]>({
    queryKey: ORDER_KEYS.list(),
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/orders`);
      return response.data;
    },
  });
};

/**
 * Загружает информацию о конкретном заказе
 */
export const useOrderDetails = (orderId: string) => {
  return useQuery<Order>({
    queryKey: ORDER_KEYS.details(orderId),
    queryFn: async () => {
      if (!orderId) throw new Error('OrderId is required');
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });
};

/**
 * Загружает доступные слоты для комнаты на определенную дату
 */
export const useRoomAvailability = (roomId: string, date?: string) => {
  return useQuery<RoomAvailability[]>({
    queryKey: ORDER_KEYS.availability(roomId, date || ''),
    queryFn: async () => {
      if (!roomId || !date) throw new Error('Room ID and date are required');
      const response = await axios.get(`${API_BASE_URL}/orders/availability`, {
        params: { room_id: roomId, date },
      });
      return response.data;
    },
    enabled: !!roomId && !!date,
  });
};

/**
 * Хук для создания нового заказа (бронирования)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: async (data) => {
      // Валидация данных перед отправкой
      if (!data.room_id || !data.start_time || !data.end_time || data.total_price <= 0) {
        throw new Error('Некорректные данные для заказа');
      }

      const response = await axios.post(`${API_BASE_URL}/orders`, data);
      return response.data;
    },
    onSuccess: (order) => {
      // Инвалидируем кэш списков заказов
      queryClient.invalidateQueries({
        queryKey: ORDER_KEYS.list(),
      });

      // Очищаем данные о доступности
      queryClient.invalidateQueries({
        queryKey: ORDER_KEYS.availability(order.room_id, ''),
      });

      toast.success('Бронирование успешно создано', {
        duration: 5000,
        icon: '✅',
      });
    },
    onError: (error) => {
      // Обработка ошибок валидации от сервера
      const axiosError = error as { response?: { data?: { message?: string; errors?: object } } };
      
      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors as object;
        const errorMsg = Object.values(errors).flat().join(', ');
        toast.error(`Ошибка: ${errorMsg}`);
      } else {
        toast.error('Ошибка при создании бронирования. Попробуйте позже.');
      }

      console.error('Error creating order:', error);
    },
  });
};

/**
 * Хук для обновления статуса заказа
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { orderId: string; status: Order['status'] }>({
    mutationFn: async ({ orderId, status }) => {
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}`, { status });
      return response.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData<Order>(ORDER_KEYS.details(order.id), order);
      queryClient.invalidateQueries({
        queryKey: ORDER_KEYS.list(),
      });

      toast.success('Статус заказа обновлен');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса заказа');
    },
  });
};

/**
 * Хук для отмены заказа
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, string>({
    mutationFn: async (orderId) => {
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}`, { status: 'cancelled' });
      return response.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData<Order>(ORDER_KEYS.details(order.id), order);
      queryClient.invalidateQueries({
        queryKey: ORDER_KEYS.list(),
      });

      toast.success('Заказ отменен');
    },
    onError: () => {
      toast.error('Ошибка при отмене заказа');
    },
  });
};

/**
 * Интерфейс для объединенного хука работы с заказами
 */
export interface UseOrdersResult {
  ordersList: Order[];
  isLoadingOrders: boolean;
  errorOrders: Error | null;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}

/**
 * Комбинированный хук для работы с заказами
 */
export const useOrders = (): UseOrdersResult => {
  const ordersQuery = useOrdersList();
  const createMutation = useCreateOrder();

  return {
    ordersList: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    errorOrders: ordersQuery.error as Error | null,
    createOrder: async (data) => {
      try {
        const result = await createMutation.mutateAsync(data);
        return result;
      } catch (error) {
        // Ошибка уже обработана в onError мутации через toast
        throw error;
      }
    },
    cancelOrder: async (orderId) => {
      try {
        await useCancelOrder().mutateAsync(orderId);
      } catch (error) {
        // Ошибка уже обработана в onError мутации через toast
        throw error;
      }
    },
  };
};
