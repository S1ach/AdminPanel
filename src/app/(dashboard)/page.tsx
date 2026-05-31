'use client';
import { useGetAnalyticsQuery } from '@entities/analytics';
import { useI18n } from '@shared/i18n';
import { Card, Skeleton } from '@shared/ui';
import { formatCurrency } from '@shared/lib';
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

  if (isLoading || !data) {
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

  // Pre-generate sparkline data from metrics data
  const revenueSparkline = data.revenueByMonth.map((x) => ({ value: x.value }));
  const usersSparkline = data.newVsChurned.map((x) => ({ value: x.newUsers }));
  const ordersSparkline = data.newVsChurned.map((x) => ({ value: x.newUsers - x.churned }));
  const conversionSparkline = data.newVsChurned.map((x, i) => ({
    value: 3.5 + (i % 3) * 0.4 + x.newUsers / 120,
  }));

  const metrics = [
    {
      label: t.dashboard.revenue,
      value: formatCurrency(data.revenue),
      trend: data.revenueTrend,
      color: 'text-indigo-600 dark:text-indigo-400',
      strokeColor: '#6366f1',
      sparkline: revenueSparkline,
    },
    {
      label: t.dashboard.usersCount,
      value: data.usersCount.toString(),
      trend: data.usersTrend,
      color: 'text-emerald-600 dark:text-emerald-400',
      strokeColor: '#10b981',
      sparkline: usersSparkline,
    },
    {
      label: t.dashboard.ordersCount,
      value: data.ordersCount.toString(),
      trend: data.ordersTrend,
      color: 'text-amber-600 dark:text-amber-400',
      strokeColor: '#f59e0b',
      sparkline: ordersSparkline,
    },
    {
      label: t.dashboard.conversion,
      value: `${data.conversion}%`,
      trend: data.conversionTrend,
      color: 'text-purple-600 dark:text-purple-400',
      strokeColor: '#8b5cf6',
      sparkline: conversionSparkline,
    },
  ];

  const kpiTargets = [
    { value: 84, label: t.dashboard.revenue, color: '#6366f1' },
    { value: 76, label: t.dashboard.usersCount, color: '#10b981' },
    { value: 91, label: t.dashboard.ordersCount, color: '#f59e0b' },
    { value: 48, label: t.dashboard.conversion, color: '#8b5cf6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
            {kpiTargets.map((param) => (
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
              <AreaChart data={data.revenueByMonth}>
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
              <BarChart data={data.newVsChurned}>
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
    </div>
  );
}
