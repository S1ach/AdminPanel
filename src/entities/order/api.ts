import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MockOrder } from '@shared/mock/db';

interface OrdersResponse {
  data: MockOrder[];
  totalCount: number;
  totalPages: number;
  page: number;
}
interface OrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Orders'],
  endpoints: (b) => ({
    getOrders: b.query<OrdersResponse, OrdersParams>({
      query: (p) => ({ url: '/orders', params: p }),
      providesTags: ['Orders'],
    }),
    getOrder: b.query<MockOrder, number>({ query: (id) => `/orders/${id}` }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery } = orderApi;
export type { MockOrder as Order, OrdersResponse, OrdersParams };
