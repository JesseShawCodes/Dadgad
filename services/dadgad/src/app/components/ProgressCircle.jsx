import React, { useContext } from 'react';
import { Context } from '../context/BracketContext';
import { calculateDisplayProgress } from '../services/progressCalculationService';

function ProgressCircle() {
  const [state] = useContext(Context);
  const currentRoundProgres = calculateDisplayProgress(state);
  const progress = Math.round(currentRoundProgres * 100);

  return (
    <>
      <div className="set-size charts-container">
      <div className={`pie-wrapper progress-${progress}`}>
        <span className="label" data-testid="progress-circle-label">{progress}<span className="smaller">%</span></span>
        <div className="pie">
          <div className="left-side half-circle"></div>
          <div className="right-side half-circle"></div>
        </div>
      </div>
      </div>
    </>
  );
}

export default ProgressCircle;
