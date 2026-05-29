'use client';
import { useGetAnalyticsQuery } from '@entities/analytics';
import { useI18n } from '@shared/i18n';
import { Card, Skeleton } from '@shared/ui';
import { formatCurrency } from '@shared/lib';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function DashboardPage() {
  const { data, isLoading } = useGetAnalyticsQuery();
  const { t } = useI18n();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>
      </div>
    );
  }

  const metrics = [
    { label: t.dashboard.revenue, value: formatCurrency(data.revenue), trend: data.revenueTrend, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: t.dashboard.usersCount, value: data.usersCount, trend: data.usersTrend, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: t.dashboard.ordersCount, value: data.ordersCount, trend: data.ordersTrend, color: 'text-amber-600 dark:text-amber-400' },
    { label: t.dashboard.conversion, value: `${data.conversion}%`, trend: data.conversionTrend, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className={`text-xs mt-1 ${m.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {m.trend >= 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
            </p>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{t.dashboard.revenueByMonth}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.revenueByMonth}>
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{t.dashboard.newVsChurned}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.newVsChurned}>
              <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="newUsers" name={t.dashboard.newUsers} fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="churned" name={t.dashboard.churnedUsers} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{t.dashboard.salesByCategory}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.salesByCategory} dataKey="value" nameKey="name" outerRadius={100} innerRadius={45}>
                {data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--tooltip-bg, #fff)', border: '1px solid #e4e4e7', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{t.dashboard.recentEvents}</h3>
          <div className="space-y-3">
            {data.recentEvents.map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{e.text}</p>
                  <p className="text-xs text-zinc-400">{new Date(e.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
