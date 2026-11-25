import {
  ApiClientError,
  apiRequest,
  selectMatchupWinnerRequest,
} from '../api/client';

describe('api client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns JSON on success', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ bracket_id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await apiRequest<{ bracket_id: number }>('/api/brackets/1/');

    expect(data.bracket_id).toBe(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/brackets/1/'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });

  it('throws ApiClientError on failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Bracket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(apiRequest('/api/brackets/999/')).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiClientError',
        status: 404,
        message: 'Bracket not found',
      }),
    );
    expect(ApiClientError.name).toBe('ApiClientError');
  });

  it('posts select-matchup-winner payload', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await selectMatchupWinnerRequest({
      bracket_id: 7,
      matchupId: 'ab',
      selectedSong: { song: { id: 'a' } },
    });

    const [, options] = (fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      bracket_id: 7,
      matchupId: 'ab',
      selectedSong: { song: { id: 'a' } },
    });
  });
});
