export function progressCalculation(state, groupProg=0, length, championship=false) {
  if (championship) {
    for (const key in state.championshipBracket) {
      groupProg += state.championshipBracket[key].progress;
    };
    return groupProg;
  }
  for (const key in state.bracket) {
    if (typeof state.bracket[key][`round${state.round}`].progress != undefined) {
      groupProg += state.bracket[key][`round${state.round}`].progress;
    }
  }
  return groupProg/length
}
