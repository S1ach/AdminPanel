'use client';
import { useState, useMemo } from 'react';
import { useGetAnalyticsQuery } from '@entities/analytics';
import { useI18n } from '@shared/i18n';
import { Card, Skeleton } from '@shared/ui';
import { cn, formatCurrency } from '@shared/lib';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

// Circular progress component for spending parameters
const CircularProgress = ({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) => {
  const radius = 18;
  const stroke = 2.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-zinc-100 dark:stroke-white/[0.04]"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Foreground circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-extrabold text-zinc-800 dark:text-zinc-200">
          {value}%
        </span>
      </div>
      <span className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 capitalize truncate max-w-[60px] text-center w-full">
        {label}
      </span>
    </div>
  );
};

export default function DashboardPage() {
  const { data, isLoading } = useGetAnalyticsQuery();
  const { t, locale } = useI18n();

  // Date selector state
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('30days');
  const [customStart, setCustomStart] = useState('2026-05-01');
  const [customEnd, setCustomEnd] = useState('2026-05-15');

  // Generate activity values for the 7x24 grid
  const heatmapData = useMemo(() => {
    const grid: number[][] = [];
    for (let day = 0; day < 7; day++) {
      const row: number[] = [];
      for (let hour = 0; hour < 24; hour++) {
        let baseVal = 10;
        if (hour >= 9 && hour <= 21) {
          baseVal = 65 + Math.sin(day + hour) * 20;
        } else {
          baseVal = 15 + Math.cos(day - hour) * 10;
        }
        if (day === 5 || day === 6) {
          baseVal += 10;
        }
        row.push(Math.max(0, Math.min(100, Math.round(baseVal))));
      }
      grid.push(row);
    }
    return grid;
  }, []);

  const computedData = useMemo(() => {
    if (!data) return null;

    let multiplier = 1.0;
    const isRu = locale === 'ru';

    let revenueChart = data.revenueByMonth;
    let newVsChurnedChart = data.newVsChurned;

    if (dateRange === 'today') {
      multiplier = 0.035;
      const hours = isRu
        ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
        : ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
      revenueChart = hours.map((h, i) => ({
        month: h,
        value: Math.round(data.revenue * multiplier * (0.6 + (i % 3) * 0.2 + Math.sin(i) * 0.1)),
      }));
      newVsChurnedChart = hours.map((h, i) => ({
        month: h,
        newUsers: Math.round(18 * (0.4 + (i % 2) * 0.4)),
        churned: Math.round(4 * (0.3 + (i % 3) * 0.2)),
      }));
    } else if (dateRange === '7days') {
      multiplier = 0.23;
      const weekdays = isRu
        ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      revenueChart = weekdays.map((w, i) => ({
        month: w,
        value: Math.round(
          ((data.revenue * multiplier) / 7) *
            (0.85 + Math.sin(i) * 0.15 + (i === 5 || i === 6 ? 0.25 : 0)),
        ),
      }));
      newVsChurnedChart = weekdays.map((w, i) => ({
        month: w,
        newUsers: Math.round(12 + Math.sin(i) * 3 + (i >= 5 ? 4 : 0)),
        churned: Math.round(3 + Math.cos(i) * 1),
      }));
    } else if (dateRange === 'custom') {
      let daysCount = 15;
      let start = new Date(customStart);
      let end = new Date(customEnd);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end.getTime() >= start.getTime()) {
        daysCount = Math.max(
          1,
          Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        );
      } else {
        start = new Date('2026-05-01');
        end = new Date('2026-05-15');
      }
      multiplier = daysCount / 30;

      const points = [];
      const tempDate = new Date(start);
      for (let i = 0; i < daysCount; i++) {
        const dayStr = tempDate.getDate().toString().padStart(2, '0');
        const monthStr = (tempDate.getMonth() + 1).toString().padStart(2, '0');
        points.push({
          dateLabel: `${dayStr}.${monthStr}`,
          revenueValue: Math.round(
            (data.revenue / 30) * (0.8 + Math.sin(i) * 0.15 + Math.cos(i * 0.4) * 0.05),
          ),
          newUsers: Math.round(15 + Math.sin(i) * 4),
          churned: Math.round(3 + Math.cos(i) * 1.5),
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }

      let sampledPoints = points;
      if (daysCount > 15) {
        const step = Math.ceil(daysCount / 10);
        sampledPoints = points.filter((_, idx) => idx % step === 0);
      }

      revenueChart = sampledPoints.map((p) => ({
        month: p.dateLabel,
        value: p.revenueValue,
      }));
      newVsChurnedChart = sampledPoints.map((p) => ({
        month: p.dateLabel,
        newUsers: p.newUsers,
        churned: p.churned,
      }));
    }

    const revenueVal = Math.round(data.revenue * multiplier);
    const usersVal = Math.round(data.usersCount * Math.min(1.0, multiplier + 0.1));
    const ordersVal = Math.round(data.ordersCount * multiplier);

    const kpiTargets = [
      {
        value: Math.min(100, Math.round(84 * Math.min(1.2, multiplier))),
        label: t.dashboard.revenue,
        color: '#6366f1',
      },
      {
        value: Math.min(100, Math.round(76 * Math.min(1.2, multiplier))),
        label: t.dashboard.usersCount,
        color: '#10b981',
      },
      {
        value: Math.min(100, Math.round(91 * Math.min(1.2, multiplier))),
        label: t.dashboard.ordersCount,
        color: '#f59e0b',
      },
      {
        value: Math.min(100, Math.round(48 * Math.min(1.2, multiplier))),
        label: t.dashboard.conversion,
        color: '#8b5cf6',
      },
    ];

    const revSpark = revenueChart.map((x) => ({ value: x.value }));
    const usrSpark = newVsChurnedChart.map((x) => ({ value: x.newUsers }));
    const ordSpark = newVsChurnedChart.map((x) => ({ value: x.newUsers - x.churned }));
    const convSpark = newVsChurnedChart.map((x, i) => ({
      value: 3.5 + (i % 3) * 0.4 + x.newUsers / 120,
    }));

    return {
      revenueVal,
      usersVal,
      ordersVal,
      revenueChart,
      newVsChurnedChart,
      kpiTargets,
      multiplier,
      revSpark,
      usrSpark,
      ordSpark,
      convSpark,
    };
  }, [data, dateRange, customStart, customEnd, locale, t]);

  if (isLoading || !data || !computedData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: t.dashboard.revenue,
      value: formatCurrency(computedData.revenueVal),
      trend: data.revenueTrend,
      color: 'text-indigo-600 dark:text-indigo-400',
      strokeColor: '#6366f1',
      sparkline: computedData.revSpark,
    },
    {
      label: t.dashboard.usersCount,
      value: computedData.usersVal.toString(),
      trend: data.usersTrend,
      color: 'text-emerald-600 dark:text-emerald-400',
      strokeColor: '#10b981',
      sparkline: computedData.usrSpark,
    },
    {
      label: t.dashboard.ordersCount,
      value: computedData.ordersVal.toString(),
      trend: data.ordersTrend,
      color: 'text-amber-600 dark:text-amber-400',
      strokeColor: '#f59e0b',
      sparkline: computedData.ordSpark,
    },
    {
      label: t.dashboard.conversion,
      value: `${data.conversion}%`,
      trend: data.conversionTrend,
      color: 'text-purple-600 dark:text-purple-400',
      strokeColor: '#8b5cf6',
      sparkline: computedData.convSpark,
    },
  ];

  const weekdayShort =
    locale === 'ru'
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Date Range Selector Toolbar */}
      <div className="lg:col-span-12 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50 dark:bg-white/[0.01] p-3 rounded-2xl border border-zinc-200/50 dark:border-white/[0.04]">
        <div className="flex items-center gap-1 bg-zinc-100/60 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto">
          {(['today', '7days', '30days', 'custom'] as const).map((r) => {
            const labels = {
              today: t.dashboard.today,
              '7days': t.dashboard.days7,
              '30days': t.dashboard.days30,
              custom: t.dashboard.custom,
            };
            return (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  'flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none outline-none border border-transparent',
                  dateRange === r
                    ? 'bg-white text-zinc-900 shadow-sm border-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-100 dark:border-white/[0.08]'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300',
                )}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>

        {dateRange === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {t.dashboard.startDate}
              </span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-lg border px-2 py-1 text-xs outline-none bg-white border-zinc-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {t.dashboard.endDate}
              </span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-lg border px-2 py-1 text-xs outline-none bg-white border-zinc-200 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Row 1: Metrics & Target Completion */}
      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className="p-4 flex flex-col justify-between h-32 rounded-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                    {m.label}
                  </p>
                  <p className={`text-xl font-extrabold tracking-tight ${m.color}`}>{m.value}</p>
                </div>
                <div className="w-16 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={m.sparkline}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={m.strokeColor}
                        strokeWidth={1.8}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    m.trend >= 0
                      ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                      : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10'
                  }`}
                >
                  {m.trend >= 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {locale === 'ru' ? 'в прошлом месяце' : 'last month'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4">
        {/* Target Completion Circular Rings */}
        <Card className="rounded-2xl p-4 flex flex-col justify-between h-32">
          <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            {locale === 'ru' ? 'Выполнение целей' : 'Target Completion'}
          </h3>
          <div className="flex items-center justify-between gap-1.5 py-1 px-0.5">
            {computedData.kpiTargets.map((param) => (
              <CircularProgress
                key={param.label}
                value={param.value}
                label={param.label}
                color={param.color}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Spline Area Revenue Chart & Donut Categories Chart */}
      <div className="lg:col-span-8">
        {/* Spline Area Revenue Chart */}
        <Card className="rounded-2xl p-5 h-[310px] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t.dashboard.revenueByMonth}
          </h3>
          <div className="w-full flex-1 mt-2">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={computedData.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg, #18181b)',
                    border: 'var(--tooltip-border-style, none)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--tooltip-text, #fff)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4">
        {/* Donut Categories Chart */}
        <Card className="rounded-2xl p-5 h-[310px] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t.dashboard.salesByCategory}
          </h3>
          <div className="relative w-full flex-1 flex items-center justify-center min-h-0">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie
                  data={data.salesByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {data.salesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg, #18181b)',
                    border: 'var(--tooltip-border-style, none)',
                    borderRadius: 12,
                    fontSize: 11,
                    color: 'var(--tooltip-text, #fff)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center text-center select-none pt-1">
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">100%</span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                {locale === 'ru' ? 'Расходы' : 'expenses'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: New vs Churned Bar Chart & Recent Events Card */}
      <div className="lg:col-span-8">
        {/* New vs Churned Bar Chart */}
        <Card className="rounded-2xl p-5 h-[330px] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t.dashboard.newVsChurned}
          </h3>
          <div className="w-full flex-1 mt-2">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={computedData.newVsChurnedChart}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg, #18181b)',
                    border: 'var(--tooltip-border-style, none)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: 'var(--tooltip-text, #fff)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                <Bar
                  dataKey="newUsers"
                  name={t.dashboard.newUsers}
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={16}
                />
                <Bar
                  dataKey="churned"
                  name={t.dashboard.churnedUsers}
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-4">
        {/* Recent Events Card */}
        <Card className="rounded-2xl p-5 h-[330px] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t.dashboard.recentEvents}
          </h3>
          <div className="space-y-3 h-[230px] overflow-y-auto pr-1 mt-3">
            {data.recentEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3 text-xs leading-normal">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-zinc-700 dark:text-zinc-300">{e.text}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {new Date(e.time).toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: Conversion Funnel & Heatmap */}
      <div className="lg:col-span-6">
        {/* Funnel Card */}
        <Card className="rounded-2xl p-5 h-[340px] flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            {t.dashboard.funnelTitle}
          </h3>
          <div className="space-y-2 py-1 flex-1 flex flex-col justify-center">
            {[
              {
                label: locale === 'ru' ? 'Показы' : 'Views',
                count: Math.round(150000 * computedData.multiplier),
                pct: 100,
                color:
                  'from-indigo-500/10 to-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
              },
              {
                label: locale === 'ru' ? 'Просмотр товаров' : 'Product Views',
                count: Math.round(108000 * computedData.multiplier),
                pct: 72,
                color:
                  'from-blue-500/10 to-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/20',
              },
              {
                label: locale === 'ru' ? 'Добавление в корзину' : 'Cart Additions',
                count: Math.round(57000 * computedData.multiplier),
                pct: 38,
                color:
                  'from-amber-500/10 to-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20',
              },
              {
                label: locale === 'ru' ? 'Начало оформления' : 'Checkout Initiated',
                count: Math.round(27000 * computedData.multiplier),
                pct: 18,
                color:
                  'from-orange-500/10 to-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/20',
              },
              {
                label: locale === 'ru' ? 'Оплаченные покупки' : 'Completed Purchases',
                count: computedData.ordersVal,
                pct: Math.round(computedData.multiplier * 4.7 * 10) / 10,
                color:
                  'from-emerald-500/10 to-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
              },
            ].map((step, idx) => {
              const widthPct = Math.max(45, 100 - idx * 12);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-1.5 rounded-xl border text-[10px] font-semibold bg-gradient-to-r shadow-sm transition-all duration-300',
                      step.color,
                    )}
                  >
                    <span className="truncate pr-2">{step.label}</span>
                    <span className="font-mono flex-shrink-0 text-[9px] font-bold">
                      {step.count.toLocaleString()} ({step.pct}%)
                    </span>
                  </div>
                  {idx < 4 && (
                    <div className="w-0.5 h-1.5 bg-zinc-200 dark:bg-white/[0.06] my-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-6">
        {/* Heatmap Card */}
        <Card className="rounded-2xl p-5 h-[340px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t.dashboard.heatmapTitle}
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2 overflow-x-auto no-scrollbar w-full">
            <div className="space-y-1.5 min-w-[280px]">
              {heatmapData.map((row, dayIdx) => (
                <div key={dayIdx} className="flex items-center gap-1">
                  {/* Day label */}
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 w-4 text-left font-sans select-none">
                    {weekdayShort[dayIdx]}
                  </span>
                  {/* Cells */}
                  <div className="flex items-center gap-1">
                    {row.map((val, hourIdx) => {
                      let cellColor = 'bg-zinc-100 dark:bg-zinc-900/60';
                      if (val >= 20 && val < 45) {
                        cellColor = 'bg-indigo-600/10 dark:bg-indigo-500/10';
                      } else if (val >= 45 && val < 70) {
                        cellColor = 'bg-indigo-600/35 dark:bg-indigo-500/35';
                      } else if (val >= 70 && val < 85) {
                        cellColor = 'bg-indigo-600/65 dark:bg-indigo-500/65';
                      } else if (val >= 85) {
                        cellColor = 'bg-indigo-600 dark:bg-indigo-400';
                      }

                      const timeLabel = `${hourIdx.toString().padStart(2, '0')}:00`;
                      return (
                        <div
                          key={hourIdx}
                          className={cn(
                            'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm transition-all hover:scale-125 cursor-pointer relative group',
                            cellColor,
                          )}
                          title={`${weekdayShort[dayIdx]} ${timeLabel} — ${val}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Hour Labels */}
            <div className="flex items-center gap-1 mt-3 pl-5 text-[8px] font-bold text-zinc-400 select-none">
              <span className="w-12 text-left">00:00</span>
              <span className="w-12 text-center">06:00</span>
              <span className="w-12 text-center">12:00</span>
              <span className="w-12 text-center">18:00</span>
              <span className="w-12 text-right">23:00</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 mt-2 select-none border-t border-zinc-100 dark:border-white/[0.04] pt-2">
            <span>{locale === 'ru' ? 'Меньше' : 'Less'}</span>
            <div className="w-2 h-2 rounded-sm bg-zinc-100 dark:bg-zinc-900/60" />
            <div className="w-2 h-2 rounded-sm bg-indigo-600/10 dark:bg-indigo-500/10" />
            <div className="w-2 h-2 rounded-sm bg-indigo-600/35 dark:bg-indigo-500/35" />
            <div className="w-2 h-2 rounded-sm bg-indigo-600/65 dark:bg-indigo-500/65" />
            <div className="w-2 h-2 rounded-sm bg-indigo-600 dark:bg-indigo-400" />
            <span>{locale === 'ru' ? 'Больше' : 'More'}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
