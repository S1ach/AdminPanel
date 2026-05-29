import { type NextRequest } from 'next/server';
import { orders, delay } from '@shared/mock/db';

export async function GET(request: NextRequest) {
  await delay();
  const sp = request.nextUrl.searchParams;
  const page = parseInt(sp.get('page') || '1', 10);
  const limit = parseInt(sp.get('limit') || '10', 10);
  const search = sp.get('search')?.toLowerCase();
  const paymentStatus = sp.get('paymentStatus');
  const deliveryStatus = sp.get('deliveryStatus');

  let filtered = [...orders];
  if (search) filtered = filtered.filter((o) => o.client.toLowerCase().includes(search) || String(o.id).includes(search));
  if (paymentStatus) filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
  if (deliveryStatus) filtered = filtered.filter((o) => o.deliveryStatus === deliveryStatus);

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const data = filtered.slice((page - 1) * limit, page * limit);

  return Response.json({ data, totalCount, totalPages, page });
}
