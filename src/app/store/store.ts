import { configureStore } from '@reduxjs/toolkit';
import { userApi } from '@entities/user';
import { productApi } from '@entities/product';
import { orderApi } from '@entities/order';
import { analyticsApi } from '@entities/analytics';

export const makeStore = () =>
  configureStore({
    reducer: {
      [userApi.reducerPath]: userApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
      [orderApi.reducerPath]: orderApi.reducer,
      [analyticsApi.reducerPath]: analyticsApi.reducer,
    },
    middleware: (gm) => gm().concat(userApi.middleware, productApi.middleware, orderApi.middleware, analyticsApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
