import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../lib/axios';
import { getApiErrorMessage } from '../lib/apiError';
import type {
  OrdersListResponse,
  OrderDetail,
  OrderCancelResponse,
} from '../types/orders';

/**
 * Список заказов с пагинацией.
 * Используется apiClient, а не голый axios: только он подставляет
 * заголовок Authorization и обновляет токен при 401.
 */
export const useOrdersList = (skip = 0, limit = 20) => {
  return useQuery<OrdersListResponse>({
    queryKey: ['orders', 'list', skip, limit],
    queryFn: async () => {
      const response = await apiClient.get<OrdersListResponse>('/orders', {
        params: { skip, limit },
      });
      return response.data;
    },
  });
};

/**
 * Детальная информация о заказе.
 */
export const useOrderDetails = (orderId: number | null) => {
  return useQuery<OrderDetail>({
    queryKey: ['orders', 'details', orderId],
    enabled: orderId !== null,
    queryFn: async () => {
      const response = await apiClient.get<OrderDetail>(`/orders/${orderId}`);
      return response.data;
    },
  });
};

/**
 * Отмена заказа клиентом с расчётом возврата.
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderCancelResponse, Error, { orderId: number; reason?: string }>({
    mutationFn: async ({ orderId, reason }) => {
      const response = await apiClient.post<OrderCancelResponse>(
        `/orders/${orderId}/cancel`,
        { reason: reason || 'Отменено клиентом' }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(
        `Заказ отменён. Возврат: ${data.refund_amount} ₽ (${data.refund_percentage}%)`
      );
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось отменить заказ'));
    },
  });
};

/**
 * Комбинированный хук для страницы заказов.
 */
export const useOrders = () => {
  const ordersQuery = useOrdersList();
  const cancelMutation = useCancelOrder();

  return {
    orders: ordersQuery.data?.items || [],
    total: ordersQuery.data?.total || 0,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error as Error | null,
    refetch: ordersQuery.refetch,
    cancelOrder: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
};
