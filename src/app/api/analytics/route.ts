import { buildAnalytics, delay } from '@shared/mock/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  await delay();
  return Response.json(buildAnalytics());
}
