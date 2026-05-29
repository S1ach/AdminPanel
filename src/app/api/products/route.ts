import { type NextRequest } from 'next/server';
import { products, delay } from '@shared/mock/db';

export async function GET(request: NextRequest) {
  await delay();
  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') || '1', 10);
  const limit = parseInt(sp.get('limit') || '10', 10);
  const search = sp.get('search')?.toLowerCase();
  const category = sp.get('category');
  const sortBy = sp.get('sortBy') || 'id';
  const sortOrder = sp.get('sortOrder') || 'asc';

  let filtered = [...products];
  if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
  if (category) filtered = filtered.filter((p) => p.category === category);

  filtered.sort((a, b) => {
    const key = sortBy as keyof typeof a;
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      return sortOrder === 'desc' ? (b[key] as number) - (a[key] as number) : (a[key] as number) - (b[key] as number);
    }
    return 0;
  });

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);

  return Response.json({ data, totalCount, totalPages, page });
}
