import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MockAnalytics } from '@shared/mock/db';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (b) => ({
    getAnalytics: b.query<MockAnalytics, void>({ query: () => '/analytics' }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
export type { MockAnalytics as Analytics };
