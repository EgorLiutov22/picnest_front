import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type {
  ScheduleTemplate,
  ScheduleException,
  ScheduleBlock,
  CreateExceptionRequest,
  CreateBlockRequest,
} from '../types/schedule';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Ключи для кэширования TanStack Query
 */
const SCHEDULE_KEYS = {
  all: ['schedules'] as const,
  templates: () => [...SCHEDULE_KEYS.all, 'templates'] as const,
  exceptions: (year?: number, month?: number) =>
    [...SCHEDULE_KEYS.all, 'exceptions', year, month] as const,
  blocks: () => [...SCHEDULE_KEYS.all, 'blocks'] as const,
} as const;

/**
 * Загружает список недельных шаблонов расписания
 */
export const useScheduleTemplates = () => {
  return useQuery<ScheduleTemplate[]>({
    queryKey: SCHEDULE_KEYS.templates(),
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/schedules/templates`);
      return response.data;
    },
  });
};

/**
 * Загружает исключения для конкретного месяца
 */
export const useScheduleExceptions = (year: number, month: number) => {
  return useQuery<ScheduleException[]>({
    queryKey: SCHEDULE_KEYS.exceptions(year, month),
    queryFn: async () => {
      // Предполагаем, что API принимает параметры start и end для диапазона дат
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month - 1, 1).toISOString();
      
      const response = await axios.get(`${API_BASE_URL}/schedules/exceptions`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    },
  });
};

/**
 * Загружает заблокированные слоты для конкретного месяца
 */
export const useScheduleBlocks = (year: number, month: number) => {
  return useQuery<ScheduleBlock[]>({
    queryKey: SCHEDULE_KEYS.blocks(),
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month - 1, 1).toISOString();
      
      const response = await axios.get(`${API_BASE_URL}/schedules/blocks`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data;
    },
  });
};

/**
 * Хук для создания исключения в расписании
 */
export const useCreateException = () => {
  const queryClient = useQueryClient();

  return useMutation<ScheduleException, Error, CreateExceptionRequest>({
    mutationFn: async (data) => {
      const response = await axios.post(`${API_BASE_URL}/schedules/exceptions`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Инвалидируем кэш исключений для текущего месяца
      const date = new Date(variables.date);
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.exceptions(date.getFullYear(), date.getMonth() + 1),
      });
      
      toast.success('Исключение успешно добавлено');
    },
    onError: () => {
      toast.error('Ошибка при создании исключения. Попробуйте позже.');
    },
  });
};

/**
 * Хук для блокировки слота в расписании
 */
export const useCreateBlock = () => {
  const queryClient = useQueryClient();

  return useMutation<ScheduleBlock, Error, CreateBlockRequest>({
    mutationFn: async (data) => {
      const response = await axios.post(`${API_BASE_URL}/schedules/blocks`, data);
      return response.data;
    },
    onSuccess: () => {
      // Инвалидируем кэш блоков для текущего месяца
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.blocks(),
      });

      toast.success('Слот успешно заблокирован');
    },
    onError: () => {
      toast.error('Ошибка при блокировке слота. Попробуйте позже.');
    },
  });
};

/**
 * Хук для удаления исключения из расписания
 */
export const useDeleteException = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (exceptionId) => {
      await axios.delete(`${API_BASE_URL}/schedules/exceptions/${exceptionId}`);
    },
    onSuccess: () => {
      // Инвалидируем кэш исключений
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.exceptions(),
      });

      toast.success('Исключение удалено');
    },
    onError: () => {
      toast.error('Ошибка при удалении исключения.');
    },
  });
};

/**
 * Хук для разблокировки слота в расписании
 */
export const useDeleteBlock = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (blockId) => {
      await axios.delete(`${API_BASE_URL}/schedules/blocks/${blockId}`);
    },
    onSuccess: () => {
      // Инвалидируем кэш блоков
      queryClient.invalidateQueries({
        queryKey: SCHEDULE_KEYS.blocks(),
      });

      toast.success('Слот разблокирован');
    },
    onError: () => {
      toast.error('Ошибка при разблокировке слота.');
    },
  });
};

/**
 * Интерфейс для объединенного хука расписания
 */
export interface UseScheduleResult {
  templates: ScheduleTemplate[];
  exceptions: ScheduleException[];
  blocks: ScheduleBlock[];
  isLoadingTemplates: boolean;
  isLoadingExceptions: boolean;
  isLoadingBlocks: boolean;
  errorTemplates: Error | null;
  errorExceptions: Error | null;
  errorBlocks: Error | null;
  createException: (data: CreateExceptionRequest) => void;
  createBlock: (data: CreateBlockRequest) => void;
  deleteException: (exceptionId: string) => void;
  deleteBlock: (blockId: string) => void;
}

/**
 * Комбинированный хук для работы с расписанием
 */
export const useSchedule = (year: number, month: number): UseScheduleResult => {
  const templatesQuery = useScheduleTemplates();
  const exceptionsQuery = useScheduleExceptions(year, month);
  const blocksQuery = useScheduleBlocks(year, month);

  return {
    templates: templatesQuery.data || [],
    exceptions: exceptionsQuery.data || [],
    blocks: blocksQuery.data || [],
    isLoadingTemplates: templatesQuery.isLoading,
    isLoadingExceptions: exceptionsQuery.isLoading,
    isLoadingBlocks: blocksQuery.isLoading,
    errorTemplates: templatesQuery.error as Error | null,
    errorExceptions: exceptionsQuery.error as Error | null,
    errorBlocks: blocksQuery.error as Error | null,
    createException: useCreateException().mutate,
    createBlock: useCreateBlock().mutate,
    deleteException: useDeleteException().mutate,
    deleteBlock: useDeleteBlock().mutate,
  };
};
