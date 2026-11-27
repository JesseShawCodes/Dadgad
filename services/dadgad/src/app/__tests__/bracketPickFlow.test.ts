/**
 * T042 (partial) — frontend coverage for the API pick client contract.
 * Full UI-driven server progression remains deferred until M6 play wiring.
 */
import {
  fetchArtistBracket,
  fetchBracketDetail,
  selectMatchupWinnerRequest,
} from '../api/client';

describe('API-driven bracket pick flow (client)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loads artist bracket then persists a pick and refreshes detail', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            artist_name: 'Test',
            artist_id: '1',
            bracket_id: 42,
            top_songs_list: [],
            matchups: [],
            bracket: { group1: { round1: { roundMatchups: [] } } },
            is_completed: false,
            championship: {},
            champion: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: 'Success',
            bracket_id: 42,
            is_completed: false,
            champion: null,
            bracket: { group1: {} },
            championship: {},
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 42,
            is_completed: false,
            champion: null,
            championship: { round5: {} },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    const page = await fetchArtistBracket('Test Artist');
    expect(page.bracket_id).toBe(42);

    const pick = await selectMatchupWinnerRequest({
      bracket_id: page.bracket_id,
      matchupId: 's1s2',
      selectedSong: { song: { id: 's1' } },
    });
    expect(pick.message).toBe('Success');

    const detail = (await fetchBracketDetail(42)) as {
      id: number;
      championship: unknown;
    };
    expect(detail.id).toBe(42);
    expect(detail.championship).toBeTruthy();

    expect((fetch as jest.Mock).mock.calls.map((c) => String(c[0]))).toEqual([
      expect.stringContaining('/api/brackets/artist/Test%20Artist'),
      expect.stringContaining('/api/brackets/select-matchup-winner/'),
      expect.stringContaining('/api/brackets/42/'),
    ]);
  });
});
