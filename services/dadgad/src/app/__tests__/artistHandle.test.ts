import { normalizeArtistHandle } from '../services/artistHandle';

describe('normalizeArtistHandle', () => {
  it('decodes percent-encoded spaces', () => {
    expect(normalizeArtistHandle('Led%20Zeppelin')).toBe('Led Zeppelin');
  });

  it('decodes double-encoded spaces', () => {
    expect(normalizeArtistHandle('Led%2520Zeppelin')).toBe('Led Zeppelin');
  });

  it('turns hyphens into spaces', () => {
    expect(normalizeArtistHandle('Led-Zeppelin')).toBe('Led Zeppelin');
  });

  it('handles array params from useParams', () => {
    expect(normalizeArtistHandle(['The%20Beatles'])).toBe('The Beatles');
  });

  it('returns empty string for missing handles', () => {
    expect(normalizeArtistHandle(undefined)).toBe('');
  });
});
