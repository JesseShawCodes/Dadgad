import { createMatchups } from './createBracket';

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Prefer the server-structured round-1 bracket from BracketCreateFromArtistView.
 * Later rounds are stripped so the existing client progression UX can own advancement.
 */
export function takeRound1Bracket(serverBracket) {
  if (!serverBracket || typeof serverBracket !== 'object') {
    return null;
  }

  const result = {};
  for (const [groupKey, groupData] of Object.entries(serverBracket)) {
    if (groupData?.round1?.roundMatchups?.length) {
      result[groupKey] = {
        round1: cloneDeep(groupData.round1),
      };
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Build the initial playable bracket: server round 1 when available, else client createMatchups.
 */
export function buildInitialBracket(musicQuery, round = 1) {
  const fromServer = takeRound1Bracket(musicQuery?.bracket);
  if (fromServer) {
    return fromServer;
  }

  const songs = musicQuery?.top_songs_list?.slice(0, 64) || [];
  if (songs.length < 2) {
    return {};
  }

  return createMatchups(songs, 1, `round${round}`);
}
