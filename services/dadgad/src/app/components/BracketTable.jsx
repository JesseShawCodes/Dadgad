import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Group from './Group';
import Championship from './Championship';
import { Context } from '../context/BracketContext';
import { isObjectEmpty } from '../services/dataService';
import ProgressCircle from './ProgressCircle';
import Champion from './Champion';
import BracketNavigation from './BracketNavigation';

function BracketTable() {
  const dispatch = useDispatch();
  const bracket = useSelector(state => state.bracket);
  const championshipRound = !isObjectEmpty(bracket.championshipBracket);

  const roundHeader = championshipRound ? 'Championship Round' : `Round ${bracket.round}`;

  const groupsList = bracket.groups;

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
      <h2 className="my-3">
        {roundHeader}
      </h2>
      {
        !bracket.champion ? <ProgressCircle /> : null
      }
      {
        championshipRound === true ? <h1>Option 1</h1> 
          : bracket.selectedGroup === 'all'
              ? groupsList.filter((group) => bracket.selectedGroup === 'all' || group.name === bracket.selectedGroup)
              .map((group) => (
                <div key={`group-container-${group.name}`}>
                  {groupContainer(group, bracket)}
                </div>
              ))
            : Object.entries(bracket.bracket).map(([group]) => (
              state.selectedGroup === group
                ? (
                  <>
                    {groupContainer(group, bracket)}
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
