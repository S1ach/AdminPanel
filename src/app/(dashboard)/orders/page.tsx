'use client';
import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGetOrdersQuery, useGetOrderQuery } from '@entities/order';
import { useI18n } from '@shared/i18n';
import { useDebounce } from '@shared/hooks';
import { Input, Select, Button, Dialog, Badge, Skeleton, Pagination } from '@shared/ui';
import { cn, formatCurrency, formatDate } from '@shared/lib';

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useI18n();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const paymentFilter = searchParams.get('paymentStatus') || '';
  const deliveryFilter = searchParams.get('deliveryStatus') || '';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [detailId, setDetailId] = useState<number | null>(null);

  const setParam = useCallback(
    (key: string, val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (val) params.set(key, val);
      else params.delete(key);
      if (key !== 'page') params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const { data, isLoading, isFetching } = useGetOrdersQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    paymentStatus: paymentFilter || undefined,
    deliveryStatus: deliveryFilter || undefined,
  });
  const { data: orderDetail } = useGetOrderQuery(detailId!, { skip: !detailId });

  const paymentOptions = [
    { label: t.orders.allPayment, value: '' },
    { label: t.orders.paid, value: 'paid' },
    { label: t.orders.pending, value: 'pending' },
    { label: t.orders.failed, value: 'failed' },
  ];
  const deliveryOptions = [
    { label: t.orders.allDelivery, value: '' },
    { label: t.orders.shipped, value: 'shipped' },
    { label: t.orders.processing, value: 'processing' },
    { label: t.orders.delivered, value: 'delivered' },
  ];

  const paymentColor = (s: string) =>
    s === 'paid'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
      : s === 'failed'
        ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
  const deliveryColor = (s: string) =>
    s === 'delivered'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
      : s === 'shipped'
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

  const loc = locale === 'ru' ? 'ru-RU' : 'en-US';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder={t.orders.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={paymentOptions}
          value={paymentFilter}
          onChange={(v) => setParam('paymentStatus', v)}
          className="w-48"
        />
        <Select
          options={deliveryOptions}
          value={deliveryFilter}
          onChange={(v) => setParam('deliveryStatus', v)}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-zinc-400">{t.common.noResults}</div>
      ) : (
        <div
          className={cn(
            'rounded-xl border overflow-hidden bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] transition-opacity',
            isFetching && 'opacity-50',
          )}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.orderId}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.client}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.amount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.paymentStatus}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.deliveryStatus}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">
                  {t.orders.date}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">
                  {t.orders.details}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setDetailId(o.id)}
                >
                  <td className="px-4 py-3 font-mono text-zinc-400">#{o.id}</td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{o.client}</td>
                  <td className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(o.amount, loc)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={paymentColor(o.paymentStatus)}>
                      {t.orders[o.paymentStatus as keyof typeof t.orders]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={deliveryColor(o.deliveryStatus)}>
                      {t.orders[o.deliveryStatus as keyof typeof t.orders]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(o.date, loc)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailId(o.id);
                      }}
                    >
                      {t.orders.details}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {t.common.total}: {data.totalCount}
          </span>
          <Pagination totalPages={data.totalPages} />
        </div>
      )}

      <Dialog open={!!detailId} onClose={() => setDetailId(null)} title={t.orders.detailsTitle}>
        {orderDetail ? (
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p>
                <span className="text-zinc-500">{t.orders.client}:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">{orderDetail.client}</span>
              </p>
              <p>
                <span className="text-zinc-500">{t.orders.amount}:</span>{' '}
                <span className="font-medium">{formatCurrency(orderDetail.amount, loc)}</span>
              </p>
              <p>
                <span className="text-zinc-500">{t.orders.address}:</span>{' '}
                <span className="text-zinc-700 dark:text-zinc-300">{orderDetail.address}</span>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                {t.orders.items}
              </h4>
              <div className="space-y-2">
                {orderDetail.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.03]"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-zinc-500">
                      {formatCurrency(item.price * item.quantity, loc)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-32" />
        )}
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
