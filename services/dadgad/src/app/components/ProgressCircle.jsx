import React, { useContext } from 'react';
import { Context } from '../context/BracketContext';
import { useSelector } from 'react-redux';

function ProgressCircle() {
  const state = useSelector(state => state.bracket);
  const progress = Math.round(state.progress * 100);

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
