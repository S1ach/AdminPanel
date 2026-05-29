import { buildAnalytics, delay } from '@shared/mock/db';

export async function GET() {
  await delay();
  return Response.json(buildAnalytics());
}
