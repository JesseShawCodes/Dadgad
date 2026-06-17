export function findObjectById(array, targetId) {
  return array.roundMatchups.find((obj) => obj.matchupId === targetId);
}

export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// Winners list
export function generateFinalRound(winnersList) {
  const nextRound = {
    final: [],
  };
  for (let i = 0; i < winnersList.length; i++) {
    nextRound.final.push(winnersList[i].attributes.winner);
  }
  return nextRound;
}

function getNextRoundMatchups(songList, round) {
  const nextRound = [];
  for (let i = 0; i < songList.length; i += 2) {
    const matchup = {
      matchupId: `${songList[i].id}${songList[i + 1].id}`,
      round: round,
      attributes: {
        matchupComplete: false,
        song1: {
          song: songList[i],
          groupRank: songList[i].rank,
          winner: null,
        },
        song2: {
          song: songList[i + 1],
          groupRank: songList[i + 1].rank,
          winner: null,
        },
      },
    };
    nextRound.push(matchup);
  }
  return nextRound;
}

export function generateNextRound(stateObject) {
  const currentRound = stateObject.round;
  let groupList = undefined;
  if (currentRound > 4) {
    groupList = stateObject.championshipBracket;
  } else {
    groupList = stateObject.bracket;
  }

  let winnersGroup = {
    group1: [],
    group2: [],
    group3: [],
    group4: [],
  };

  let nextRoundMatchups = {};

  if (currentRound < 5) {
    for (const key in groupList) {
      if (groupList.hasOwnProperty(key)) {
        const matchups = groupList[key][`round${currentRound}`].roundMatchups;
        winnersGroup[`${key}`] = compileListOfWinners(matchups);
      }
    }
  } else {
    let matchups = groupList[`round${currentRound}`].roundMatchups;
    winnersGroup = compileListOfWinners(matchups);
  }

  // winnersgroup should be an array of objects


  if (stateObject.round == 5) {
    const finalMatchup = {
      matchupId: `${winnersGroup[0].id}${winnersGroup[1].id}`,
      attributes: {
        matchupComplete: false,
        song1: {
          song: winnersGroup[0],
          groupRank: winnersGroup[0].rank,
          winner: null,
        },
        song2: {
          song: winnersGroup[1],
          groupRank: winnersGroup[1].rank,
          winner: null,
        },
      }
    }
    return [finalMatchup];
  }

  for (const key in winnersGroup) {

    // IF ALL ARRAYS in WINNERS GROUP are of length 1, need to run getFinalFourMatchup
    
    if (checkArrayLengths(winnersGroup)) {
      nextRoundMatchups = getFinalFourMatchup(winnersGroup)
    } else {
      nextRoundMatchups[key] = getNextRoundMatchups(winnersGroup[key], stateObject.round + 1);
    }
  }

  return nextRoundMatchups;
}

function checkArrayLengths(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      if (obj[key].length > 1) {
        return false;
      }
    }
  }
  return true;
}

function getFinalFourMatchup(finalFourSongs) {
  const fourSongs = [];
  for (const song in finalFourSongs) {
    fourSongs.push(finalFourSongs[song][0])
  }

  return getNextRoundMatchups(fourSongs);
}

function compileListOfWinners(matchups, winnersGroup = []) {
  for (let i = 0; i < matchups.length; i++) {
    typeof (matchups[i].attributes.winner) !== 'undefined' ? winnersGroup.push(matchups[i].attributes.winner) : null;
  }
  return winnersGroup;
}
