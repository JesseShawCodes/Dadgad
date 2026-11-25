import { findObjectById, generateNextRound } from './dataService';
import { progressCalculation } from './progressCalculationService';

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}

function updateRoundProgress(roundGroup) {
  if (!roundGroup?.roundMatchups) {
    return 0;
  }

  let completedProgress = 0;
  for (let i = 0; i < roundGroup.roundMatchups.length; i += 1) {
    if (roundGroup.roundMatchups[i].attributes.matchupComplete) {
      completedProgress += 1;
    }
  }

  return completedProgress / roundGroup.roundMatchups.length;
}

function maybeAdvanceRound(dispatch, state, currentPositionBracket, championship) {
  const len = Object.keys(currentPositionBracket).length;
  const currentRoundProgres = progressCalculation(state, 0, len, championship);

  dispatch({
    type: 'setCurrentRoundProgres',
    payload: { currentRoundProgres },
  });

  if (currentRoundProgres !== 1) {
    return;
  }

  dispatch({ type: 'setRound', payload: { round: state.round + 1 } });
  const nextRound = generateNextRound(state);

  if (Array.isArray(nextRound)) {
    let updatedChampionship = { ...state.championshipBracket };

    if (nextRound.length === 2) {
      updatedChampionship = {
        round5: {
          progress: 0,
          roundMatchups: nextRound,
        },
        round6: {
          progress: null,
          roundMatchups: null,
        },
      };
    }
    if (nextRound.length === 1) {
      updatedChampionship = {
        ...updatedChampionship,
        round6: {
          progress: 0,
          roundMatchups: [nextRound[0]],
        },
      };
    }

    dispatch({
      type: 'setChampionshipBracket',
      payload: { championshipBracket: updatedChampionship },
    });
    return;
  }

  const updatedBracket = { ...state.bracket };
  const nextRoundNumber = `round${state.round + 1}`;
  for (const groupKey of ['group1', 'group2', 'group3', 'group4']) {
    if (nextRound[groupKey]) {
      if (!updatedBracket[groupKey]) {
        updatedBracket[groupKey] = {};
      }
      updatedBracket[groupKey][nextRoundNumber] = {
        progress: 0,
        roundMatchups: nextRound[groupKey],
      };
    }
  }

  dispatch({
    type: 'setBracket',
    payload: { bracket: updatedBracket },
  });
}

/**
 * Applies a matchup pick in local bracket state and advances rounds when complete.
 * Server persistence is handled separately by the caller.
 */
export function applyLocalMatchupPick({
  dispatch,
  state,
  thissong,
  opponent,
  matchupId,
  round,
  group,
}) {
  const championship = Object.keys(state.championshipBracket).length !== 0;
  const finalTwo = championship
    && state.championshipBracket.round6?.roundMatchups;

  if (finalTwo) {
    const updatedChampionship = cloneDeep(state.championshipBracket);
    const roundGroup = updatedChampionship[`round${state.round}`];
    const findObject = findObjectById(roundGroup, matchupId);
    if (findObject) {
      findObject.attributes.winner = thissong.song;
      findObject.attributes.loser = opponent.song;
      findObject.attributes.matchupComplete = true;
      roundGroup.progress = updateRoundProgress(roundGroup);

      dispatch({
        type: 'setChampionshipBracket',
        payload: { championshipBracket: updatedChampionship },
      });
    }

    dispatch({
      type: 'setChampion',
      payload: { champion: thissong },
    });
    return;
  }

  if (championship) {
    const updatedChampionship = cloneDeep(state.championshipBracket);
    const roundGroup = updatedChampionship[`round${state.round}`];
    const findObject = findObjectById(roundGroup, matchupId);
    if (!findObject) {
      return;
    }

    findObject.attributes.winner = thissong.song;
    findObject.attributes.loser = opponent.song;
    findObject.attributes.matchupComplete = true;
    roundGroup.progress = updateRoundProgress(roundGroup);

    dispatch({
      type: 'setChampionshipBracket',
      payload: { championshipBracket: updatedChampionship },
    });

    const nextState = {
      ...state,
      championshipBracket: updatedChampionship,
    };
    maybeAdvanceRound(dispatch, nextState, updatedChampionship, true);
    return;
  }

  const updatedBracket = cloneDeep(state.bracket);
  const roundGroup = updatedBracket[group][`round${round}`];
  const findObject = findObjectById(roundGroup, matchupId);
  if (!findObject) {
    return;
  }

  findObject.attributes.winner = thissong.song;
  findObject.attributes.loser = opponent.song;
  findObject.attributes.matchupComplete = true;
  roundGroup.progress = updateRoundProgress(roundGroup);

  dispatch({
    type: 'setBracket',
    payload: { bracket: updatedBracket },
  });

  const nextState = {
    ...state,
    bracket: updatedBracket,
  };
  maybeAdvanceRound(dispatch, nextState, updatedBracket, false);
}
