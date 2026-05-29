import { users, delay } from '@shared/mock/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await delay();
  const { id } = await params;
  const body = await request.json();
  const idx = users.findIndex((u) => u.id === parseInt(id, 10));
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  users[idx] = { ...users[idx], ...body };
  return Response.json(users[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await delay();
  const { id } = await params;
  const idx = users.findIndex((u) => u.id === parseInt(id, 10));
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  users.splice(idx, 1);
  return Response.json({ success: true });
}
