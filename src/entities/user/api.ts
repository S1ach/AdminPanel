import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MockUser } from '@shared/mock/db';

interface UsersResponse { data: MockUser[]; totalCount: number; totalPages: number; page: number; }
interface UsersParams { page?: number; limit?: number; search?: string; role?: string; status?: string; }

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Users'],
  endpoints: (b) => ({
    getUsers: b.query<UsersResponse, UsersParams>({ query: (p) => ({ url: '/users', params: p }), providesTags: ['Users'] }),
    updateUser: b.mutation<MockUser, { id: number; body: Partial<MockUser> }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: b.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = userApi;
export type { MockUser as User, UsersResponse, UsersParams };
