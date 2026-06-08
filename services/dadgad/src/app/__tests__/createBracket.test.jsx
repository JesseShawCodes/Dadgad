
import { createMatchups } from '../services/createBracket';

describe('createMatchups', () => {
  const createSong = (id, rank) => ({ id, rank, name: `Song ${id}` });

  it('should pair songs correctly (highest rank with lowest rank)', () => {
    const songs = [
      createSong('1', 1),
      createSong('2', 2),
      createSong('3', 3),
      createSong('4', 4),
    ];
    // Pairing should be: 1-4, 2-3
    const result = createMatchups(songs, 'round1', 'round1');

    // Group 1 gets the first matchup (1-4)
    expect(result.group1.round1.roundMatchups[0].matchupId).toBe('14');
    expect(result.group1.round1.roundMatchups[0].attributes.song1.song.id).toBe('1');
    expect(result.group1.round1.roundMatchups[0].attributes.song2.song.id).toBe('4');

    // Group 2 gets the second matchup (2-3)
    expect(result.group2.round1.roundMatchups[0].matchupId).toBe('23');
    expect(result.group2.round1.roundMatchups[0].attributes.song1.song.id).toBe('2');
    expect(result.group2.round1.roundMatchups[0].attributes.song2.song.id).toBe('3');
  });

  it('should distribute matchups across groups in round-robin fashion', () => {
    const songs = Array.from({ length: 16 }, (_, i) => createSong(`${i + 1}`, i + 1));
    // 16 songs -> 8 matchups
    // Pairings: 1-16, 2-15, 3-14, 4-13, 5-12, 6-11, 7-10, 8-9
    // Distribution:
    // Group 1: Matchup 1 (1-16), Matchup 5 (5-12)
    // Group 2: Matchup 2 (2-15), Matchup 6 (6-11)
    // Group 3: Matchup 3 (3-14), Matchup 7 (7-10)
    // Group 4: Matchup 4 (4-13), Matchup 8 (8-9)

    const result = createMatchups(songs, 'round1', 'round1');

    expect(result.group1.round1.roundMatchups.length).toBe(2);
    expect(result.group1.round1.roundMatchups[0].matchupId).toBe('116');
    expect(result.group1.round1.roundMatchups[1].matchupId).toBe('512');

    expect(result.group4.round1.roundMatchups.length).toBe(2);
    expect(result.group4.round1.roundMatchups[0].matchupId).toBe('413');
    expect(result.group4.round1.roundMatchups[1].matchupId).toBe('89');
  });

  it('should set the correct round strings in the output structure', () => {
    const songs = [createSong('1', 1), createSong('2', 2)];
    const result = createMatchups(songs, 'matchup_round_string', 'current_round_key');

    expect(result.group1.current_round_key).toBeDefined();
    expect(result.group1.current_round_key.roundMatchups[0].round).toBe('matchup_round_string');
  });

  it('should initialize progress and matchupComplete correctly', () => {
    const songs = [createSong('1', 1), createSong('2', 2)];
    const result = createMatchups(songs, 'round1', 'round1');

    const matchup = result.group1.round1.roundMatchups[0];
    expect(matchup.attributes.matchupComplete).toBe(false);
    expect(matchup.attributes.song1.winner).toBeNull();
    expect(matchup.attributes.song2.winner).toBeNull();
    expect(result.group1.round1.progress).toBeNull();
  });

  it('should handle an empty array of songs', () => {
    const result = createMatchups([], 'round1', 'round1');
    expect(result.group1.round1.roundMatchups).toEqual([]);
    expect(result.group2.round1.roundMatchups).toEqual([]);
    expect(result.group3.round1.roundMatchups).toEqual([]);
    expect(result.group4.round1.roundMatchups).toEqual([]);
  });

  it('should handle an odd number of songs by ignoring the middle one', () => {
    const songs = [
      createSong('1', 1),
      createSong('2', 2),
      createSong('3', 3), // Middle song, should be ignored by Math.floor(len/2)
    ];
    const result = createMatchups(songs, 'round1', 'round1');
    
    // Only 1 matchup (1-3)
    expect(result.group1.round1.roundMatchups.length).toBe(1);
    expect(result.group1.round1.roundMatchups[0].matchupId).toBe('13');
    expect(result.group2.round1.roundMatchups.length).toBe(0);
  });
});
