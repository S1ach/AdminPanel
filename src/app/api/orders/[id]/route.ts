import { orders, delay } from '@shared/mock/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay();
  const { id } = await params;
  const order = orders.find((o) => o.id === parseInt(id, 10));
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(order);
}
