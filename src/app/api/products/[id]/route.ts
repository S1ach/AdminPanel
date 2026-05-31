import { products, delay } from '@shared/mock/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay();
  const { id } = await params;
  const body = await request.json();
  const idx = products.findIndex((p) => p.id === parseInt(id, 10));
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  products[idx] = {
    ...products[idx],
    ...body,
    status: (body.stock ?? products[idx].stock) > 0 ? 'in_stock' : 'out_of_stock',
  };
  return Response.json(products[idx]);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await delay();
  const { id } = await params;
  const idx = products.findIndex((p) => p.id === parseInt(id, 10));
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  products.splice(idx, 1);
  return Response.json({ success: true });
}
