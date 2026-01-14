import React, { useContext } from 'react';
import Group from './Group';
import Championship from './Championship';
import { Context } from '../context/BracketContext';
import { isObjectEmpty } from '../services/dataService';
import ProgressCircle from './ProgressCircle';
import Champion from './Champion';
import BracketNavigation from './BracketNavigation';

function BracketTable() {
  const value = useContext(Context);
  const [state] = value;
  const championshipRound = !isObjectEmpty(state.championshipBracket);

  const roundHeader = championshipRound ? 'Championship Round' : `Round ${state.round}`;

  const groupsList = state.groups;

  const groupContainer = (groupName, stateContainer) => {
    let group;
    if (typeof (groupName) === 'object') {
      group = groupName.name;
    } else {
      group = groupName;
    }
    const round = `round${stateContainer.round}`;

    const matchups = stateContainer.bracket[group][round];

    return <Group groupName={group} matchups={matchups} key={group} round={round} />;
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
        {roundHeader}
      </h2>
      {
        !state.champion ? <ProgressCircle /> : null
      }
      {
        championshipRound === true ? <Championship />
          : state.selectedGroup === 'all'
            ? groupsList.filter((group) => state.selectedGroup === 'all' || group.name === state.selectedGroup)
              .map((group) => (
                <div key={`group-container-${group.name}`}>
                  {groupContainer(group, state)}
                </div>
              ))
            : Object.entries(state.bracket).map(([group]) => (
              state.selectedGroup === group
                ? (
                  <>
                    {groupContainer(group, state)}
                  </>
                )
                : null))
      }
      {
        state.champion ? <Champion /> : null
      }
    </>
  );
}

export default BracketTable;
