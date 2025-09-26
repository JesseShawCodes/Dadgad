import { React, useContext } from 'react';
import { useParams } from 'next/navigation';

import { Context } from '../../context/BracketContext';
import WarningMessage from '../WarningMessage';

function InProgressBracket() {
  const { handle } = useParams();
  const value = useContext(Context);
  const [state, dispatch] = value;

  const showInProgressBracket = () => {
    const inProgressBracket = JSON.parse(localStorage.getItem("userBracket")).find(item => item.artist == handle);
    dispatch({ type: 'setRound', payload: { round: inProgressBracket.round}});
    dispatch({ type: 'setBracket', payload: { bracket: inProgressBracket.bracket}});
    dispatch({ type: 'setCurrentRoundProgres', payload: {currentRoundProgres: inProgressBracket.currentRoundProgres}});
  }

  return (
    <>
      <WarningMessage message="You currently have a bracket in progress for this artist." type="info" />
      <button type="button" className="btn btn-primary" onClick={showInProgressBracket}>
        Show In Progress Bracket
      </button>
    </>
  );
}

export default InProgressBracket;
