import axios from 'axios';
import { apiBaseUrl } from './envConfig';
import { calculateDisplayProgress } from './progressCalculationService';

function enrichSongMetadata(song, songsById) {
  if (!song?.id) {
    return song;
  }

  const fullSong = songsById[String(song.id)];
  if (!fullSong?.attributes?.artwork) {
    return song;
  }

  return {
    ...fullSong,
    ...song,
    attributes: {
      ...fullSong.attributes,
      ...song.attributes,
      artwork: {
        ...fullSong.attributes.artwork,
        ...song.attributes?.artwork,
      },
    },
    rank: song.rank ?? fullSong.rank,
  };
}

function enrichSongSlot(slot, songsById) {
  if (!slot?.song) {
    return slot;
  }

  return {
    ...slot,
    song: enrichSongMetadata(slot.song, songsById),
  };
}

function enrichMatchup(matchup, songsById) {
  const { attributes } = matchup;
  if (!attributes) {
    return matchup;
  }

  return {
    ...matchup,
    attributes: {
      ...attributes,
      song1: enrichSongSlot(attributes.song1, songsById),
      song2: enrichSongSlot(attributes.song2, songsById),
      winner: attributes.winner
        ? enrichSongMetadata(attributes.winner, songsById)
        : attributes.winner,
      loser: attributes.loser
        ? enrichSongMetadata(attributes.loser, songsById)
        : attributes.loser,
    },
  };
}

function enrichRoundData(roundData, songsById) {
  if (!roundData?.roundMatchups) {
    return roundData;
  }

  return {
    ...roundData,
    roundMatchups: roundData.roundMatchups.map((matchup) =>
      enrichMatchup(matchup, songsById),
    ),
  };
}

function enrichGroupedBracket(bracket, topSongsList) {
  if (!bracket || !topSongsList?.length) {
    return bracket;
  }

  const songsById = Object.fromEntries(
    topSongsList.map((song) => [String(song.id), song]),
  );
  const enriched = {};

  for (const [groupKey, groupData] of Object.entries(bracket)) {
    enriched[groupKey] = {};
    for (const [roundKey, roundData] of Object.entries(groupData)) {
      enriched[groupKey][roundKey] = enrichRoundData(roundData, songsById);
    }
  }

  return enriched;
}

function enrichChampionshipBracket(championshipBracket, topSongsList) {
  if (!championshipBracket || !topSongsList?.length) {
    return championshipBracket;
  }

  const songsById = Object.fromEntries(
    topSongsList.map((song) => [String(song.id), song]),
  );
  const enriched = { ...championshipBracket };

  for (const roundKey of ['round5', 'round6']) {
    if (enriched[roundKey]) {
      enriched[roundKey] = enrichRoundData(enriched[roundKey], songsById);
    }
  }

  return enriched;
}

function enrichChampion(champion, topSongsList) {
  if (!champion || !topSongsList?.length) {
    return champion;
  }

  const songsById = Object.fromEntries(
    topSongsList.map((song) => [String(song.id), song]),
  );

  if (champion.song) {
    return {
      ...champion,
      song: enrichSongMetadata(champion.song, songsById),
    };
  }

  return enrichSongMetadata(champion, songsById);
}

export function applySessionBracketState(dispatch, data, topSongsList = []) {
  const bracket = enrichGroupedBracket(data.bracket, topSongsList);
  const championshipBracket = enrichChampionshipBracket(
    data.championshipBracket || {},
    topSongsList,
  );
  const champion = enrichChampion(data.champion, topSongsList);

  if (bracket) {
    dispatch({ type: 'setBracket', payload: { bracket } });
  }
  dispatch({
    type: 'setChampionshipBracket',
    payload: {
      championshipBracket,
    },
  });
  dispatch({
    type: 'setRound',
    payload: { round: data.round || 1 },
  });

  const progressState = {
    bracket: bracket || {},
    championshipBracket,
    round: data.round || 1,
  };
  dispatch({
    type: 'setCurrentRoundProgres',
    payload: { currentRoundProgres: calculateDisplayProgress(progressState) },
  });

  if (champion) {
    dispatch({ type: 'setChampion', payload: { champion } });
  } else {
    dispatch({ type: 'setChampion', payload: { champion: undefined } });
  }
}

export async function resetSessionBracket(bracketId, sessionId) {
  const response = await axios.post(
    `${apiBaseUrl}/api/brackets/${bracketId}/session/reset/`,
    { sessionId },
    { withCredentials: true },
  );
  return response.data;
}
