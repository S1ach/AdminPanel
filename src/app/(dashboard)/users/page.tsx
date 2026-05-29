'use client';
import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useGetUsersQuery, useDeleteUserMutation, useUpdateUserMutation, type User } from '@entities/user';
import { useI18n } from '@shared/i18n';
import { useDebounce } from '@shared/hooks';
import { Input, Select, Button, Dialog, Avatar, Badge, Skeleton, Pagination, useToast } from '@shared/ui';
import { cn, formatDate } from '@shared/lib';
import { USER_ROLES, USER_STATUSES } from '@shared/config';

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const roleFilter = searchParams.get('role') || '';
  const statusFilter = searchParams.get('status') || '';

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const setParam = useCallback((key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val); else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  const { data, isLoading, isFetching } = useGetUsersQuery({ page, limit, search: debouncedSearch || undefined, role: roleFilter || undefined, status: statusFilter || undefined });

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' as string, status: '' as string });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    toast(t.users.deleteTitle, 'success');
    setDeleteTarget(null);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    await updateUser({ id: editTarget.id, body: editForm as Partial<User> });
    toast(t.settings.saved, 'success');
    setEditTarget(null);
  };

  const openEdit = (u: User) => {
    setEditForm({ name: u.name, email: u.email, role: u.role, status: u.status });
    setEditTarget(u);
  };

  const roleOptions = [{ label: t.users.allRoles, value: '' }, ...USER_ROLES.map((r) => ({ label: t.common[r], value: r }))];
  const statusOptions = [{ label: t.users.allStatuses, value: '' }, ...USER_STATUSES.map((s) => ({ label: t.common[s], value: s }))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder={t.users.search} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select options={roleOptions} value={roleFilter} onChange={(v) => setParam('role', v)} placeholder={t.users.allRoles} className="w-40" />
        <Select options={statusOptions} value={statusFilter} onChange={(v) => setParam('status', v)} placeholder={t.users.allStatuses} className="w-40" />
        <Select options={[{ label: '10', value: '10' }, { label: '20', value: '20' }, { label: '50', value: '50' }]} value={String(limit)} onChange={(v) => setParam('limit', v)} className="w-20" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : !data?.data.length ? (
        <div className="text-center py-20 text-zinc-400">{t.common.noResults}</div>
      ) : (
        <div className={cn('rounded-xl border overflow-hidden bg-white dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.06] transition-opacity', isFetching && 'opacity-50')}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.users.name}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.users.email}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.users.role}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.users.status}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">{t.users.registered}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">{t.users.actions}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-white/[0.04] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-zinc-400">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.avatar} fallback={u.name.charAt(0)} />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : u.role === 'manager' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400'}>
                      {t.common[u.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={u.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}>
                      {t.common[u.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(u.registeredAt, locale === 'ru' ? 'ru-RU' : 'en-US')}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>{t.users.edit}</Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(u)}>{t.users.delete}</Button>
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

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t.users.deleteTitle}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{t.users.deleteConfirm}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t.common.cancel}</Button>
          <Button variant="danger" onClick={handleDelete}>{t.common.confirm}</Button>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} title={t.users.editTitle}>
        <div className="space-y-3 mb-6">
          <Input label={t.users.name} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label={t.users.email} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.users.role}</span>
              <Select options={USER_ROLES.map((r) => ({ label: t.common[r], value: r }))} value={editForm.role} onChange={(v) => setEditForm((f) => ({ ...f, role: v }))} />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.users.status}</span>
              <Select options={USER_STATUSES.map((s) => ({ label: t.common[s], value: s }))} value={editForm.status} onChange={(v) => setEditForm((f) => ({ ...f, status: v }))} />
            </div>
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

export default function UsersPage() {
  return <Suspense><UsersContent /></Suspense>;
}
