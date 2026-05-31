'use client';

import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '@shared/i18n';
import { Card, Input, Button, Dialog, Select } from '@shared/ui';
import { cn } from '@shared/lib';

interface CalendarEvent {
  id: string;
  title: string;
  category: 'marketing' | 'maintenance' | 'task' | 'promo';
  date: string; // YYYY-MM-DD
  description?: string;
}

const CATEGORY_COLORS: Record<
  CalendarEvent['category'],
  { bg: string; border: string; text: string; dot: string; labelRu: string; labelEn: string }
> = {
  marketing: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-200 dark:border-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-600 dark:bg-indigo-400',
    labelRu: 'Маркетинг',
    labelEn: 'Marketing',
  },
  maintenance: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-600 dark:bg-red-400',
    labelRu: 'Обслуживание',
    labelEn: 'Maintenance',
  },
  task: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-600 dark:bg-amber-400',
    labelRu: 'Задача',
    labelEn: 'Task',
  },
  promo: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    labelRu: 'Промокод',
    labelEn: 'Promo',
  },
};

const pad = (n: number) => String(n).padStart(2, '0');

const getDefaultEvents = (locale: string): CalendarEvent[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const dStr = (day: number) => `${y}-${pad(m + 1)}-${pad(day)}`;

  return [
    {
      id: '1',
      title: locale === 'ru' ? 'Летняя распродажа -15%' : 'Summer Sale -15%',
      category: 'marketing',
      date: dStr(15),
      description:
        locale === 'ru'
          ? 'Акции на все категории товаров в летнем каталоге'
          : 'Promo across all product categories in summer catalog',
    },
    {
      id: '2',
      title: locale === 'ru' ? 'Email-рассылка: брошенные корзины' : 'Email: Abandoned Carts',
      category: 'marketing',
      date: dStr(8),
      description:
        locale === 'ru'
          ? 'Автоматическая рассылка писем пользователям'
          : 'Send automated recovery emails to clients',
    },
    {
      id: '3',
      title: locale === 'ru' ? 'Техническое обслуживание базы' : 'DB Maintenance Window',
      category: 'maintenance',
      date: dStr(22),
      description:
        locale === 'ru'
          ? 'Оптимизация индексов базы данных и бэкапы'
          : 'Database index re-indexing and system backup',
    },
    {
      id: '4',
      title: locale === 'ru' ? 'Промокод WELCOME50' : 'Promo Code WELCOME50',
      category: 'promo',
      date: dStr(3),
      description:
        locale === 'ru'
          ? 'Запуск промокода со скидкой 50% для новых клиентов'
          : 'Activate a 50% discount coupon code for new signups',
    },
    {
      id: '5',
      title: locale === 'ru' ? 'Обновить карточки товаров' : 'Update Product Photos',
      category: 'task',
      date: dStr(27),
      description:
        locale === 'ru'
          ? 'Добавить новые фотографии для товаров категории Спорт'
          : 'Upload recent visual media assets for Sports product categories',
    },
  ];
};

export default function CalendarPage() {
  const { t, locale } = useI18n();

  // Selected date state
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Events state loaded from localStorage
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Category filter state
  const [activeFilters, setActiveFilters] = useState<Record<CalendarEvent['category'], boolean>>({
    marketing: true,
    maintenance: true,
    task: true,
    promo: true,
  });

  // Modal dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CalendarEvent['category']>('marketing');
  const [formDescription, setFormDescription] = useState('');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem('calendar-events');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEvents(JSON.parse(saved));
      } catch {
        const defaultEv = getDefaultEvents(locale);

        setEvents(defaultEv);
        localStorage.setItem('calendar-events', JSON.stringify(defaultEv));
      }
    } else {
      const defaultEv = getDefaultEvents(locale);

      setEvents(defaultEv);
      localStorage.setItem('calendar-events', JSON.stringify(defaultEv));
    }
  }, [locale]);

  // Helper to persist events
  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  // Grid calculation
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Weekday of 1st day of month (0 = Sun, 1 = Mon ... 6 = Sat)
    // Convert to European layout (Monday = 0, Tuesday = 1 ... Sunday = 6)
    let startDayIdx = firstDay.getDay();
    startDayIdx = startDayIdx === 0 ? 6 : startDayIdx - 1;

    const totalDays = lastDay.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    // 1. Previous month padding cells
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${prevY}-${pad(prevM + 1)}-${pad(d)}`,
      });
    }

    // 2. Current month cells
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        dateStr: `${year}-${pad(month + 1)}-${pad(d)}`,
      });
    }

    // 3. Next month padding cells (fill up to multiples of 7, i.e., 35 or 42 cells)
    const targetSize = cells.length <= 35 ? 35 : 42;
    const paddingCount = targetSize - cells.length;
    for (let d = 1; d <= paddingCount; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      cells.push({
        day: d,
        isCurrentMonth: false,
        dateStr: `${nextY}-${pad(nextM + 1)}-${pad(d)}`,
      });
    }

    return cells;
  }, [year, month]);

  // Filtered events mapping: dateStr -> events list
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (activeFilters[e.category]) {
        if (!map[e.date]) map[e.date] = [];
        map[e.date].push(e);
      }
    });
    return map;
  }, [events, activeFilters]);

  // Upcoming events side panel selector
  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return events
      .filter((e) => e.date >= todayStr && activeFilters[e.category])
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, activeFilters]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Add Event trigger
  const handleOpenAdd = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setFormTitle('');
    setFormCategory('marketing');
    setFormDescription('');
    setShowAddDialog(true);
  };

  const handleSaveNew = () => {
    if (!formTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: String(Date.now()),
      title: formTitle.trim(),
      category: formCategory,
      date: selectedDateStr,
      description: formDescription.trim() || undefined,
    };

    saveEvents([...events, newEv]);
    setShowAddDialog(false);
  };

  // Edit Event trigger
  const handleOpenEdit = (e: React.MouseEvent, ev: CalendarEvent) => {
    e.stopPropagation(); // Avoid triggering the cell's add event modal
    setSelectedEvent(ev);
    setFormTitle(ev.title);
    setFormCategory(ev.category);
    setFormDescription(ev.description || '');
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEvent || !formTitle.trim()) return;

    const updated = events.map((e) =>
      e.id === selectedEvent.id
        ? {
            ...e,
            title: formTitle.trim(),
            category: formCategory,
            description: formDescription.trim() || undefined,
          }
        : e,
    );

    saveEvents(updated);
    setShowEditDialog(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    const filtered = events.filter((e) => e.id !== selectedEvent.id);
    saveEvents(filtered);
    setShowEditDialog(false);
  };

  // Formats date string to display in dialogs
  const formatCellDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const categoryOptions = [
    { label: locale === 'ru' ? 'Маркетинг' : 'Marketing', value: 'marketing' },
    { label: locale === 'ru' ? 'Обслуживание' : 'Maintenance', value: 'maintenance' },
    { label: locale === 'ru' ? 'Задача' : 'Task', value: 'task' },
    { label: locale === 'ru' ? 'Промокод' : 'Promo', value: 'promo' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Filters & Upcoming Events */}
      <div className="lg:col-span-3 space-y-6">
        {/* Category Filters */}
        <Card className="p-4">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            {t.calendar.categories}
          </h3>
          <div className="space-y-2">
            {(Object.keys(CATEGORY_COLORS) as Array<CalendarEvent['category']>).map((cat) => {
              const cl = CATEGORY_COLORS[cat];
              const label = locale === 'ru' ? cl.labelRu : cl.labelEn;
              return (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={activeFilters[cat]}
                    onChange={() => setActiveFilters((f) => ({ ...f, [cat]: !f[cat] }))}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/20 bg-white dark:bg-white/5 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cl.dot)} />
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                      {label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        {/* Upcoming List */}
        <Card className="p-4 flex flex-col min-h-[250px]">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5">
            {t.calendar.upcoming}
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 py-10">
                <svg
                  className="w-8 h-8 mb-2 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">{t.calendar.noEvents}</span>
              </div>
            ) : (
              upcomingEvents.map((e) => {
                const cl = CATEGORY_COLORS[e.category];
                return (
                  <div
                    key={e.id}
                    onClick={(clickEv) => handleOpenEdit(clickEv, e)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-sm',
                      cl.bg,
                      cl.border,
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span
                        className={cn('text-[9px] font-bold uppercase tracking-wider', cl.text)}
                      >
                        {locale === 'ru' ? cl.labelRu : cl.labelEn}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold font-mono">
                        {new Date(e.date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {e.title}
                    </h4>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Main Calendar View */}
      <div className="lg:col-span-9">
        <Card className="p-4 flex flex-col h-full min-h-[580px]">
          {/* Calendar Header / Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 select-none pb-2 border-b border-zinc-100 dark:border-white/[0.04]">
            <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{locale === 'ru' ? t.calendar.months[month] : t.calendar.months[month]}</span>
              <span className="text-zinc-400 font-mono text-sm font-medium">{year}</span>
            </h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleGoToday}>
                {t.calendar.today}
              </Button>
              <div className="flex items-center rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden">
                <button
                  onClick={handlePrevMonth}
                  className="px-2.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-600 dark:bg-transparent dark:hover:bg-white/5 dark:text-zinc-400 transition-colors border-r border-zinc-200 dark:border-white/10 flex items-center justify-center cursor-pointer"
                  title="Prev Month"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-2.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-600 dark:bg-transparent dark:hover:bg-white/5 dark:text-zinc-400 transition-colors flex items-center justify-center cursor-pointer"
                  title="Next Month"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout Container */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center select-none">
              {t.calendar.weekdays.map((w: string) => (
                <div
                  key={w}
                  className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase py-1"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 gap-1.5 min-h-[460px]">
              {calendarCells.map((cell) => {
                const dayEvents = eventsByDate[cell.dateStr] || [];
                const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleOpenAdd(cell.dateStr)}
                    className={cn(
                      'p-1.5 border rounded-xl flex flex-col h-full min-h-[64px] sm:min-h-[76px] transition-all hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] cursor-pointer relative group',
                      cell.isCurrentMonth
                        ? 'bg-white border-zinc-200 dark:bg-white/[0.02] dark:border-white/[0.04]'
                        : 'bg-zinc-50/40 border-zinc-100 dark:bg-zinc-950/20 dark:border-white/[0.02] opacity-40',
                      isToday &&
                        'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950',
                    )}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-[10px] font-bold font-mono px-1 rounded-md flex items-center justify-center h-4 min-w-[16px]',
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : cell.isCurrentMonth
                              ? 'text-zinc-700 dark:text-zinc-300'
                              : 'text-zinc-400 dark:text-zinc-600',
                        )}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* Events wrapper */}
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[48px] sm:max-h-[58px] no-scrollbar">
                      {dayEvents.map((e) => {
                        const cl = CATEGORY_COLORS[e.category];
                        return (
                          <div
                            key={e.id}
                            onClick={(clickEv) => handleOpenEdit(clickEv, e)}
                            className={cn(
                              'px-1.5 py-0.5 rounded-lg border text-[9px] font-semibold truncate leading-tight transition-transform duration-100 hover:scale-[1.02] active:scale-[0.98]',
                              cl.bg,
                              cl.border,
                              cl.text,
                            )}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title={t.calendar.newEvent}
      >
        <div className="space-y-4 mb-6">
          <p className="text-xs text-zinc-500 font-semibold font-mono">
            {formatCellDate(selectedDateStr)}
          </p>

          <Input
            label={t.calendar.eventTitle}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder={locale === 'ru' ? 'Введите название...' : 'Enter title...'}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.calendar.category}
            </span>
            <Select
              options={categoryOptions}
              value={formCategory}
              onChange={(v) => setFormCategory(v as CalendarEvent['category'])}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.calendar.description}
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              placeholder={
                locale === 'ru'
                  ? 'Введите описание (необязательно)...'
                  : 'Enter details (optional)...'
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-white border-zinc-300 text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSaveNew} disabled={!formTitle.trim()}>
            {t.common.save}
          </Button>
        </div>
      </Dialog>

      {/* Edit/Detail Event Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        title={t.calendar.editEvent}
      >
        <div className="space-y-4 mb-6">
          {selectedEvent && (
            <p className="text-xs text-zinc-500 font-semibold font-mono">
              {formatCellDate(selectedEvent.date)}
            </p>
          )}

          <Input
            label={t.calendar.eventTitle}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.calendar.category}
            </span>
            <Select
              options={categoryOptions}
              value={formCategory}
              onChange={(v) => setFormCategory(v as CalendarEvent['category'])}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.calendar.description}
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-white border-zinc-300 text-zinc-900 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="danger" onClick={handleDeleteEvent}>
            {t.common.delete}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveEdit} disabled={!formTitle.trim()}>
              {t.common.save}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
