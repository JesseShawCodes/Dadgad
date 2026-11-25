import { buildInitialBracket, takeRound1Bracket } from '../services/serverBracket';

describe('serverBracket helpers', () => {
  it('takes only round1 from a server structured bracket', () => {
    const serverBracket = {
      group1: {
        round1: { progress: 0, roundMatchups: [{ matchupId: '12' }] },
        round2: { progress: null, roundMatchups: [] },
      },
      group2: {
        round1: { progress: 0, roundMatchups: [{ matchupId: '34' }] },
      },
    };

    const result = takeRound1Bracket(serverBracket);

    expect(result.group1.round1.roundMatchups).toHaveLength(1);
    expect(result.group1.round2).toBeUndefined();
    expect(result.group2.round1.roundMatchups[0].matchupId).toBe('34');
  });

  it('falls back to createMatchups when server bracket is missing', () => {
    const songs = [
      { id: '1', rank: 1 },
      { id: '2', rank: 2 },
      { id: '3', rank: 3 },
      { id: '4', rank: 4 },
    ];

    const result = buildInitialBracket({ top_songs_list: songs }, 1);

    expect(result.group1.round1.roundMatchups.length).toBeGreaterThan(0);
  });
});
