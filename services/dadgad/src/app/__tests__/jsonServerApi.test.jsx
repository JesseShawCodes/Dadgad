
import { configureStore } from '@reduxjs/toolkit';
import { 
  jsonServerApi,
  useGetArtistsQuery,
  useGetTaskStatusQuery,
  useLazyGetTaskStatusQuery,
  useStartSearchMutation,
} from '../services/jsonServerApi';

const setupApiStore = (api) => {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (gdm) => gdm({ serializableCheck: false, immutableCheck: false }).concat(api.middleware),
  });
  return store;
};

describe('jsonServerApi', () => {
  let store;

  beforeEach(() => {
    store = setupApiStore(jsonServerApi);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getArtists', () => {
    it('sends correct request for getArtists', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      await store.dispatch(jsonServerApi.endpoints.getArtists.initiate('Test Artist'));

      const request = fetch.mock.calls[0][0];
      const url = typeof request === 'string' ? request : request.url;
      const method = typeof request === 'string' ? fetch.mock.calls[0][1]?.method : request.method;

      expect(url).toContain('/artist?q=Test Artist');
      expect(method).toBe('GET');
    });

    it('handles successful response for getArtists', async () => {
      const mockData = { results: [{ id: 1, name: 'Test Artist' }] };
      fetch.mockResolvedValueOnce(new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      const result = await store.dispatch(jsonServerApi.endpoints.getArtists.initiate('Test Artist'));

      expect(result.data).toEqual(mockData);
      expect(result.status).toBe('fulfilled');
    });
  });

  describe('getArtistInfo', () => {
    it('sends correct request for getArtistInfo', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      await store.dispatch(jsonServerApi.endpoints.getArtistInfo.initiate('test-artist'));

      const request = fetch.mock.calls[0][0];
      const url = typeof request === 'string' ? request : request.url;
      expect(url).toContain('/artist-page/test-artist');
    });
  });

  describe('getTaskStatus', () => {
    it('sends correct request for getTaskStatus', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'PENDING' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      await store.dispatch(jsonServerApi.endpoints.getTaskStatus.initiate('task-123'));

      const request = fetch.mock.calls[0][0];
      const url = typeof request === 'string' ? request : request.url;
      expect(url).toContain('/api/task-status?q=task-123');
    });
  });

  describe('startSearch', () => {
    it('sends correct request for startSearch (mutation)', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'task-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));

      await store.dispatch(jsonServerApi.endpoints.startSearch.initiate('Search Query'));

      const request = fetch.mock.calls[0][0];
      const url = typeof request === 'string' ? request : request.url;
      const method = typeof request === 'string' ? fetch.mock.calls[0][1]?.method : request.method;

      expect(url).toContain('/artist?q=Search Query');
      expect(method).toBe('GET');
    });
  });

  describe('Error handling', () => {
    it('handles server error', async () => {
      fetch.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));

      const result = await store.dispatch(jsonServerApi.endpoints.getArtists.initiate('Test'));

      expect(result.error).toBeDefined();
      expect(result.status).toBe('rejected');
    });
  });

  describe('Exported hooks', () => {
    it('should export all expected hooks', () => {
      expect(useGetArtistsQuery).toBeDefined();
      expect(useGetTaskStatusQuery).toBeDefined();
      expect(useLazyGetTaskStatusQuery).toBeDefined();
      expect(useStartSearchMutation).toBeDefined();
    });
  });
});
