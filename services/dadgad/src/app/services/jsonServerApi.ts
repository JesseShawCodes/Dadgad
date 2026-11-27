import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from './envConfig';
import type { ArtistPagePayload, StartSearchResponse, TaskStatusResponse } from '../api/types';

export const jsonServerApi = createApi({
  reducerPath: 'jsonServerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    // Public catalog endpoints do not need cookies. Keep credentialed calls in
    // api/client.ts for write paths that may rely on session cookies later.
  }),
  refetchOnMountOrArgChange: true,
  tagTypes: ['Artists', 'Bracket'],
  endpoints: (builder) => ({
    getArtists: builder.query<unknown, string>({
      query: (artist) => ({
        url: `/api/artists/search?q=${encodeURIComponent(artist)}`,
      }),
    }),
    getArtistInfo: builder.query<unknown, string>({
      query: (artistName) => ({
        url: `/api/artists/${encodeURIComponent(artistName)}/page`,
      }),
    }),
    getArtistPage: builder.query<ArtistPagePayload, string>({
      query: (artistId) => ({
        url: `/api/brackets/artist/${encodeURIComponent(artistId)}`,
      }),
      providesTags: ['Bracket'],
    }),
    getTaskStatus: builder.query<TaskStatusResponse, string>({
      query: (taskId) => `/api/task-status?q=${encodeURIComponent(taskId)}`,
      keepUnusedDataFor: 0,
    }),
    startSearch: builder.mutation<StartSearchResponse, string>({
      query: (queryParam) => ({
        url: `/api/artists/search?q=${encodeURIComponent(queryParam)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetArtistsQuery,
  useGetArtistInfoQuery,
  useGetArtistPageQuery,
  useGetTaskStatusQuery,
  useLazyGetTaskStatusQuery,
  useStartSearchMutation,
} = jsonServerApi;
