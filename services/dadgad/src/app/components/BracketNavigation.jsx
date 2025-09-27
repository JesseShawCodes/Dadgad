import { React, useContext, useState } from 'react';
import { Context } from '../context/BracketContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { progressCalculation } from '../services/progressCalculationService';

function BracketNavigation() {
  const value = useContext(Context);
  const [state, dispatch] = value;

  // Function to navigate to the previous round
  const handlePrevious = () => {
    dispatch({ type: 'setRound', payload: { round: state.round - 1 } });
    console.log(progressCalculation(state, 0, Object.keys(state.bracket).length));
    dispatch({ type: 'setCurrentRoundProgres', payload: { currentRoundProgres: 0.20 } });
  };

  // Function to navigate to the next round
  const handleNext = () => {
    dispatch({ type: 'setRound', payload: { round: state.round + 1 } });
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center p-4">
        <div className="p-5 w-100">
          {/* Navigation buttons */}
          <div className="d-flex justify-content-between align-items-center">
            <button
              onClick={handlePrevious}
              disabled={state.round === 1}
              className={`btn btn-lg px-4 rounded-pill
                ${state.round === 1 ? 'btn-secondary text-secondary-emphasis' : 'btn-primary shadow-sm'}
              `}
            >
              <FontAwesomeIcon icon={faArrowLeft} className='text-white' /> Previous
            </button>
            <div className="text-center mb-4 p-4 bg-opacity-10">
              <h2 className="fs-4 text-white mb-2">
                Round {state.round}
              </h2>
            </div>
            <button
              onClick={handleNext}
              disabled={state.round === state.roundTotal}
              className={`btn btn-lg px-4 rounded-pill
                ${state.round === state.roundTotal ? 'btn-secondary text-secondary-emphasis' : 'btn-primary shadow-sm'}
              `}
            >
              Next <FontAwesomeIcon icon={faArrowRight} className='text-white' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BracketNavigation;
