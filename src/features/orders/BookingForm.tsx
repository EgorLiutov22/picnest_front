import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import apiClient from '../../lib/axios';
import { getApiErrorMessage } from '../../lib/apiError';
import type { StudioRoomOption, BookingFormValues, CreateOrderPayload } from '../../types/orders';

interface BookingFormProps {
  availableRooms: StudioRoomOption[];
  defaultRoomId?: number;
  onCreated?: () => void;
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Форма бронирования зала студии.
 * Отправляет POST /api/v1/orders; итоговую сумму считает сервер.
 */
export const BookingForm: React.FC<BookingFormProps> = ({ availableRooms, defaultRoomId, onCreated }) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BookingFormValues>({
    defaultValues: {
      studio_room_id: defaultRoomId ?? availableRooms[0]?.id ?? 0,
      booking_date: format(new Date(Date.now() + 24 * 3600 * 1000), 'yyyy-MM-dd'),
      start_time: '10:00',
      end_time: '13:00',
      prepayment_amount: '',
    },
    mode: 'onChange',
  });

  const values = watch();
  const selectedRoom = availableRooms.find((r) => r.id === Number(values.studio_room_id));

  const hours = React.useMemo(() => {
    if (!values.start_time || !values.end_time) return 0;
    const minutes = toMinutes(values.end_time) - toMinutes(values.start_time);
    return minutes > 0 ? minutes / 60 : 0;
  }, [values.start_time, values.end_time]);

  const estimatedTotal = selectedRoom ? Number(selectedRoom.price_per_hour) * hours : 0;

  const createOrder = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      // new Date('2026-12-01T10:00:00') парсится как локальное время,
      // toISOString() переводит его в UTC — бэкенд хранит tstzrange.
      const start = new Date(`${data.booking_date}T${data.start_time}:00`);
      const end = new Date(`${data.booking_date}T${data.end_time}:00`);

      const payload: CreateOrderPayload = {
        items: [
          {
            resource_type: 'studio_room',
            resource_id: Number(data.studio_room_id),
            start_time: start.toISOString(),
            end_time: end.toISOString(),
          },
        ],
        prepayment_amount: data.prepayment_amount || '0.00',
        cancellation_conditions: {},
      };

      const response = await apiClient.post('/orders', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Бронирование создано');
      reset();
      onCreated?.();
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Не удалось создать бронирование'));
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => createOrder.mutate(data))}
      className="card grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.5px] text-ink">Новое бронирование</h2>
          <p className="mt-1 text-sm text-muted">Выберите зал, дату и время съёмки</p>
        </div>

        {availableRooms.length === 0 && (
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Список залов пока не загружен. Обратитесь к администратору студии.
          </div>
        )}

        <div>
          <label htmlFor="studio_room_id" className="field-label">
            Зал студии
          </label>
          <select
            id="studio_room_id"
            {...register('studio_room_id', { required: 'Выберите зал', valueAsNumber: true })}
            className={`field ${errors.studio_room_id ? 'field-error' : ''}`}
          >
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
                {room.studio_title ? ` — ${room.studio_title}` : ''}
              </option>
            ))}
          </select>
          {errors.studio_room_id && <p className="mt-1.5 text-sm text-red-600">{errors.studio_room_id.message}</p>}
        </div>

        <div>
          <label htmlFor="booking_date" className="field-label">
            Дата
          </label>
          <input
            id="booking_date"
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            {...register('booking_date', { required: 'Выберите дату' })}
            className={`field ${errors.booking_date ? 'field-error' : ''}`}
          />
          {errors.booking_date && <p className="mt-1.5 text-sm text-red-600">{errors.booking_date.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="field-label">
              Начало
            </label>
            <input
              id="start_time"
              type="time"
              {...register('start_time', { required: 'Укажите время начала' })}
              className={`field ${errors.start_time ? 'field-error' : ''}`}
            />
          </div>
          <div>
            <label htmlFor="end_time" className="field-label">
              Окончание
            </label>
            <input
              id="end_time"
              type="time"
              {...register('end_time', {
                required: 'Укажите время окончания',
                validate: (v) => v > values.start_time || 'Окончание должно быть позже начала',
              })}
              className={`field ${errors.end_time ? 'field-error' : ''}`}
            />
          </div>
        </div>
        {(errors.start_time || errors.end_time) && (
          <p className="-mt-3 text-sm text-red-600">{errors.start_time?.message || errors.end_time?.message}</p>
        )}

        <div>
          <label htmlFor="prepayment_amount" className="field-label">
            Предоплата, ₽
          </label>
          <input
            id="prepayment_amount"
            inputMode="decimal"
            placeholder="0"
            {...register('prepayment_amount', {
              pattern: { value: /^\d*(\.\d{1,2})?$/, message: 'Введите сумму, например 1000 или 1000.50' },
            })}
            className={`field ${errors.prepayment_amount ? 'field-error' : ''}`}
          />
          {errors.prepayment_amount ? (
            <p className="mt-1.5 text-sm text-red-600">{errors.prepayment_amount.message}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted">
              Не больше итоговой суммы. Оплата — наличными исполнителю на месте.
            </p>
          )}
        </div>
      </div>

      {/* Итог */}
      <aside className="flex flex-col gap-5 rounded-panel bg-surface p-6">
        <p className="eyebrow">Итого</p>
        <div className="flex flex-col gap-3 text-sm">
          <Row label="Зал" value={selectedRoom?.name ?? '—'} />
          <Row
            label="Цена за час"
            value={selectedRoom ? `${Number(selectedRoom.price_per_hour).toLocaleString('ru-RU')} ₽` : '—'}
          />
          <Row label="Длительность" value={hours ? `${hours.toLocaleString('ru-RU')} ч` : '—'} />
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-sm text-muted">Предварительно</p>
          <p className="mt-1 text-[32px] font-bold leading-none tracking-tighter2 text-ink">
            {estimatedTotal.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </p>
          <p className="mt-2 text-xs text-muted">Итоговую сумму рассчитает сервер по актуальному прайсу.</p>
        </div>
        <button
          type="submit"
          disabled={createOrder.isPending || availableRooms.length === 0}
          className="btn-primary mt-auto w-full"
        >
          {createOrder.isPending ? 'Отправка…' : 'Забронировать'}
        </button>
      </aside>
    </form>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted">{label}</span>
    <span className="font-semibold text-ink">{value}</span>
  </div>
);

export default BookingForm;
