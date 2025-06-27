import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { jsonServerApi } from './services/jsonServerApi';

const store = configureStore({
  reducer: {
    [jsonServerApi.reducerPath]: jsonServerApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(jsonServerApi.middleware),
});

setupListeners(store.dispatch);

export default store;
