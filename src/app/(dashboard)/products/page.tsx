'use client';
import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation, type Product } from '@entities/product';
import { useI18n } from '@shared/i18n';
import { useDebounce } from '@shared/hooks';
import { Input, Select, Button, Dialog, Badge, Skeleton, Pagination, useToast } from '@shared/ui';
import { cn, formatCurrency } from '@shared/lib';
import { PRODUCT_CATEGORIES } from '@shared/config';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const setParam = useCallback((key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val); else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const toggleSort = (col: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === col) {
      params.set('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', col);
      params.set('sortOrder', 'asc');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data, isLoading, isFetching } = useGetProductsQuery({ page, limit, search: debouncedSearch || undefined, category: categoryFilter || undefined, sortBy, sortOrder });

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, stock: 0, category: '' });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    toast(t.products.deleteTitle, 'success');
    setDeleteTarget(null);
  };

  const openEdit = (p: Product) => {
    setEditForm({ name: p.name, price: p.price, stock: p.stock, category: p.category });
    setEditTarget(p);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    await updateProduct({ id: editTarget.id, body: editForm });
    toast(t.settings.saved, 'success');
    setEditTarget(null);
  };

  const catOptions = [{ label: t.products.allCategories, value: '' }, ...PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }))];

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300" onClick={() => toggleSort(col)}>
      {label} {sortBy === col && (sortOrder === 'asc' ? '↑' : '↓')}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]"><Input placeholder={t.products.search} value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Select options={catOptions} value={categoryFilter} onChange={(v) => setParam('category', v)} className="w-44" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-zinc-400">{t.common.noResults}</div>
      ) : (
        <div className={cn('rounded-xl border overflow-hidden bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] transition-opacity', isFetching && 'opacity-50')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.products.sku}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.products.photo}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.products.name}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.products.category}</th>
                <SortHeader col="price" label={t.products.price} />
                <SortHeader col="stock" label={t.products.stock} />
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.products.status}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">{t.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{p.sku}</td>
                  <td className="px-4 py-3">
                    <img src={p.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.category}</td>
                  <td className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">{formatCurrency(p.price, locale === 'ru' ? 'ru-RU' : 'en-US')}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.stock}</td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === 'in_stock' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}>
                      {p.status === 'in_stock' ? t.products.inStock : t.products.outOfStock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>{t.products.edit}</Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(p)}>{t.products.delete}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{t.common.total}: {data.totalCount}</span>
        <Pagination totalPages={data.totalPages} />
      </div>}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t.products.deleteTitle}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{t.products.deleteConfirm}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t.common.cancel}</Button>
          <Button variant="danger" onClick={handleDelete}>{t.common.confirm}</Button>
        </div>
      </Dialog>

      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} title={t.products.editTitle}>
        <div className="space-y-3 mb-6">
          <Input label={t.products.name} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="flex gap-3">
            <Input label={t.products.price} type="number" value={String(editForm.price)} onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))} />
            <Input label={t.products.stock} type="number" value={String(editForm.stock)} onChange={(e) => setEditForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditTarget(null)}>{t.common.cancel}</Button>
          <Button onClick={handleEdit}>{t.common.save}</Button>
        </div>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense><ProductsContent /></Suspense>;
}
