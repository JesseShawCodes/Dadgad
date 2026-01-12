import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// https://redux-toolkit.js.org/rtk-query/usage/queries
export const jsonServerApi = createApi({
  reducerPath: 'jsonServerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER,
  }),
  refetchOnMountOrArgChange: true,
  tagTypes: ['Artists'],
  endpoints: (builder) => ({
    getArtists: builder.query({
      query: (artist) => {
        console.log('Fetching artists with query:', artist);
        return {
          url: `/artist?q=${artist}`,
        };
      },
    }),
    getArtistInfo: builder.query({
      query: (artistName) => {
        console.log('Fetching artist info for:', artistName);
        return {
          url: `/artist-page/${artistName}`,
        };
      },
    }),
    getTaskStatus: builder.query({
      query: (taskId) => {
        console.log('Fetching task status for taskId:', taskId);
        return `/api/task-status?q=${taskId}`;
      },
      keepUnusedDataFor: 0,
    }),
    startSearch: builder.mutation({
      query: (queryParam) => {
        console.log('Starting search with queryParam:', queryParam);
        return {
          url: `/artist?q=${queryParam}`,
          method: 'GET',
        };
      },
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
