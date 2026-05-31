import { type NextRequest } from 'next/server';
import { users, delay } from '@shared/mock/db';

export async function GET(request: NextRequest) {
  await delay();
  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') || '1', 10);
  const limit = parseInt(sp.get('limit') || '10', 10);
  const search = sp.get('search')?.toLowerCase();
  const role = sp.get('role');
  const status = sp.get('status');

  let filtered = [...users];
  if (search)
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
    );
  if (role) filtered = filtered.filter((u) => u.role === role);
  if (status) filtered = filtered.filter((u) => u.status === status);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);

  return Response.json({ data, totalCount, totalPages, page });
}
