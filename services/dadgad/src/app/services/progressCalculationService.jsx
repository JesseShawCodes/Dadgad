export function progressCalculation(state, groupProg = 0, length, championship = false) {
  if (championship) {
    const roundData = state.championshipBracket?.[`round${state.round}`];
    const roundProgress = roundData?.progress;
    if (typeof roundProgress === 'number') {
      return roundProgress;
    }
    return 0;
  }

  for (const key in state.bracket) {
    const roundProgress = state.bracket[key]?.[`round${state.round}`]?.progress;
    if (typeof roundProgress === 'number') {
      groupProg += roundProgress;
    }
  }

  if (!length) {
    return 0;
  }

  return groupProg / length;
}

export function calculateDisplayProgress(state) {
  const championship = Object.keys(state.championshipBracket || {}).length > 0;
  const length = championship
    ? Object.keys(state.championshipBracket).length
    : Object.keys(state.bracket || {}).length;

  return progressCalculation(state, 0, length, championship);
}
