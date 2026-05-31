import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MockProduct } from '@shared/mock/db';

interface ProductsResponse {
  data: MockProduct[];
  totalCount: number;
  totalPages: number;
  page: number;
}
interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Products'],
  endpoints: (b) => ({
    getProducts: b.query<ProductsResponse, ProductsParams>({
      query: (p) => ({ url: '/products', params: p }),
      providesTags: ['Products'],
    }),
    updateProduct: b.mutation<MockProduct, { id: number; body: Partial<MockProduct> }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: b.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const { useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation } =
  productApi;
export type { MockProduct as Product, ProductsResponse, ProductsParams };
