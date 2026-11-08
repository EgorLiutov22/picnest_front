import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = [
  { title: 'Портреты', image: '/img/categories/portrait.jpg', featured: true },
  { title: 'Мероприятия', image: '/img/categories/cat1.jpg' },
  { title: 'Семья', image: '/img/categories/cat2.jpg' },
  { title: 'Авто', image: '/img/categories/cat3.jpg' },
  { title: 'Недвижимость', image: '/img/categories/cat4.jpg' },
  { title: 'Предметная съёмка', image: '/img/categories/cat5.jpg', wide: true },
];

const STEPS = [
  {
    icon: '/img/icons/card-symbol-search.png',
    title: 'Выберите зал',
    text: 'Посмотрите доступные залы студий, их площадь и почасовую стоимость.',
  },
  {
    icon: '/img/icons/card-symbol-calendar.png',
    title: 'Укажите дату и время',
    text: 'Сервис проверит, свободен ли слот, и сразу посчитает итоговую сумму.',
  },
  {
    icon: '/img/icons/card-symbol-img.png',
    title: 'Приходите на съёмку',
    text: 'Оплата на месте исполнителю. Отмена с полным возвратом — за сутки до начала.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const goBook = () => navigate(isAuthenticated ? '/orders?new=1' : '/register');

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface">
        <div className="container-pn relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <span className="pill self-start">Фотографы · Видеографы · Фотостудии</span>
            <h1 className="text-[32px] font-bold leading-[1.1] tracking-tightest text-ink md:text-[58px]">
              Найдите идеального фотографа или студию{' '}
              <span className="text-brand">за 1 минуту</span>
            </h1>
            <p className="max-w-[657px] text-base leading-[1.55] text-muted md:text-lg">
              Проверенные специалисты с прозрачными ценами и реальными портфолио. Бронируйте
              онлайн без звонков.
            </p>

            <div className="flex flex-col items-stretch gap-4 rounded-card bg-white p-4 shadow-float sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-[18px]">
              <SearchHint icon="/img/icons/symbol-camera.png" title="Что снимаем?" text="Портрет, свадьба, предмет" />
              <span className="hidden h-10 w-px bg-line sm:block" />
              <SearchHint icon="/img/icons/symbol-calendar.png" title="Дата и время" text="Когда планируете съёмку?" />
              <button type="button" onClick={goBook} className="btn-primary shrink-0 py-[18px] sm:w-[225px]">
                <img src="/img/icons/btn-symbol-icon.png" alt="" className="w-5" />
                Забронировать
              </button>
            </div>
          </div>

          <div className="relative hidden h-[460px] lg:block">
            <img
              src="/img/hero/hero-1.jpg"
              alt="Фотосъёмка в студии"
              className="absolute right-6 top-0 w-[62%] rotate-[5deg] rounded-card object-cover shadow-float"
            />
            <img
              src="/img/hero/hero-2.jpg"
              alt="Портретная съёмка"
              className="absolute bottom-0 left-0 w-[48%] -rotate-[4deg] rounded-card object-cover shadow-float"
            />
            <img
              src="/img/hero/hero-3.jpg"
              alt="Предметная съёмка"
              className="absolute bottom-10 right-0 w-[38%] rotate-[3deg] rounded-card object-cover shadow-float"
            />
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="bg-white py-16 md:py-20">
        <div className="container-pn flex flex-col gap-8">
          <div className="text-center">
            <h2 className="section-title">Что вам нужно снять?</h2>
            <p className="section-lead mt-3">Для важных моментов и больших идей</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={goBook}
                className={`group relative flex min-h-[256px] items-start overflow-hidden rounded-card p-5 text-left ${
                  c.featured ? 'shadow-brand lg:row-span-2' : ''
                } ${c.wide ? 'sm:col-span-2' : ''}`}
              >
                <img
                  src={c.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-b from-[rgba(23,16,32,0.8)] via-[rgba(33,26,50,0)] to-transparent" />
                <span className="relative flex w-full items-start justify-between">
                  <span className="text-lg font-semibold text-white">{c.title}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                    <img src="/img/icons/circle-symbol-arrow-up.png" alt="" className="w-4" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="bg-surface py-16 md:py-24">
        <div className="container-pn flex flex-col gap-10">
          <div className="text-center">
            <p className="eyebrow">Как это работает</p>
            <h2 className="section-title mt-3">3 шага до идеальных кадров</h2>
            <p className="section-lead mx-auto mt-3 max-w-[640px]">
              Найдите подходящий зал, выберите время и забронируйте съёмку без лишних звонков.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="card flex min-h-[280px] flex-col gap-5 p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-card bg-brand-soft">
                  <img src={s.icon} alt="" className="w-6" />
                </span>
                <h3 className="text-2xl font-bold leading-[1.2] tracking-[-0.5px] text-ink">{s.title}</h3>
                <p className="text-base leading-[1.55] text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Для специалистов */}
      <section className="bg-ink">
        <div className="container-pn flex flex-col gap-6 py-16 md:py-[72px]">
          <p className="text-[13px] font-semibold text-white/70">Для специалистов</p>
          <h2 className="max-w-[920px] text-[30px] font-bold leading-[1.1] tracking-[-1.8px] text-white md:text-[44px]">
            Вы фотограф или студия? PicNest приведёт вам клиентов
          </h2>
          <p className="max-w-[720px] text-lg leading-[1.55] text-white/80">
            Добавьте залы и услуги, укажите цены — и получайте заявки на бронирование. Мы берём
            на себя расписание и проверку свободных слотов.
          </p>
          <button
            type="button"
            onClick={() => navigate('/register?role=studio')}
            className="btn-light self-start"
          >
            Стать специалистом
          </button>
        </div>
      </section>
    </PageLayout>
  );
};

const SearchHint: React.FC<{ icon: string; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex flex-1 items-center gap-4">
    <img src={icon} alt="" className="w-6 shrink-0" />
    <div className="flex flex-col gap-1.5">
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="text-sm text-muted">{text}</p>
    </div>
  </div>
);

export default HomePage;
