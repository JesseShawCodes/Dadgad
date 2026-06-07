import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';

// https://redux-toolkit.js.org/rtk-query/usage/queries
export const jsonServerApi = createApi({
  reducerPath: 'jsonServerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  refetchOnMountOrArgChange: true,
  tagTypes: ['Artists'],
  endpoints: (builder) => ({
    getArtists: builder.query({
      query: (artist) => ({
        url: `/artist?q=${artist}`,
      }),
    }),
    getArtistInfo: builder.query({
      query: (artistName) => ({
        url: `/artist-page/${artistName}`,
      }),
    }),
    getTaskStatus: builder.query({
      query: (taskId) => `/api/task-status?q=${taskId}`,
      keepUnusedDataFor: 0,
    }),
    startSearch: builder.mutation({
      query: (queryParam) => ({
        url: `/artist?q=${queryParam}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetArtistsQuery,
  useGetArtistInfoQuery,
  useGetTaskStatusQuery,
  useLazyGetTaskStatusQuery,
  useStartSearchMutation,
} = jsonServerApi;
