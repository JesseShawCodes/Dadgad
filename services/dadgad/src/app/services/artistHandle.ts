/**
 * Normalize an artist route handle from the URL into a readable name / API query.
 * Handles leftover percent-encoding from double-encoded links (e.g. Led%20Zeppelin).
 */
export function normalizeArtistHandle(handle: string | string[] | undefined): string {
  const raw = Array.isArray(handle) ? handle[0] : handle;
  if (!raw) {
    return '';
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // One more pass if a double-encoded value left literal %20 / + in place.
  if (/%[0-9A-Fa-f]{2}/.test(decoded)) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // keep prior decode
    }
  }

  return decoded.replace(/\+/g, ' ').replace(/-/g, ' ').trim();
}
