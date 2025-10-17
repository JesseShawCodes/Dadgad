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
      query: (artist) => ({
        url: `/artist?q=${artist}`,
      }),
    }),
    getArtistInfo: builder.query({
      query: (artistName) => ({
        url: `/artist-page/${artistName}`,
      }),
    }),
    createBracket: builder.mutation({
        query: ({ songs, currentRound, matchupRound }) => {
            return {
                url: '/artist/matchups',
                method: 'POST',
                body: { songs, currentRound, matchupRound }
            };
        },
        transformResponse: (response) => {
          return response;
        },
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
  useCreateBracketMutation,
  useGetTaskStatusQuery,
  useLazyGetTaskStatusQuery,
  useStartSearchMutation,
} = jsonServerApi;
