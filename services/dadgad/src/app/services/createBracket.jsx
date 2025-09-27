export const createMatchups = (arr, matchupRound, currentRound) => {
  const matchups = [];
  const len = arr.length;

  for (let i = 0; i < Math.floor(len / 2); i += 1) {
    matchups.push(
      {
        matchupId: arr[i].id + arr[len - 1 - i].id,
        round: matchupRound,
        attributes: {
          matchupComplete: false,
          song1: {
            song: arr[i],
            groupRank: i + 1,
            winner: null,
          },
          song2: {
            song: arr[len - 1 - i],
            groupRank: arr[len - 1 - i].rank,
            winner: null,
          },
        },
      },
    );
  }

  const groups = {
    group1: {
      [currentRound]: {
        roundMatchups: [],
        progress: null,
      },
    },
    group2: {
      [currentRound]: {
        roundMatchups: [],
        progress: null,
      },
    },
    group3: {
      [currentRound]: {
        roundMatchups: [],
        progress: null,
      },
    },
    group4: {
      [currentRound]: {
        roundMatchups: [],
        progress: null,
      },
    },
  };

  for (let i = 0; i < matchups.length; i += 1) {
    groups[`group${(i % 4) + 1}`][`${currentRound}`].roundMatchups.push(matchups[i]);
  }

  return groups;
};
