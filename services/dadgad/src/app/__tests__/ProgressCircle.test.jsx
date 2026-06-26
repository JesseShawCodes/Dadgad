import React from 'react';
import { render, screen } from '@testing-library/react';
import { Context } from '../context/BracketContext';
import ProgressCircle from '../components/ProgressCircle';

describe('ProgressCircle', () => {
  const renderWithState = (state) => render(
    <Context.Provider value={[state, jest.fn()]}>
      <ProgressCircle />
    </Context.Provider>,
  );

  it('renders with 0% progress', () => {
    const state = {
      round: 1,
      bracket: { group1: { round1: { progress: 0 } } },
      championshipBracket: {},
    };
    renderWithState(state);
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('0%');
  });

  it('renders with 50% progress', () => {
    const state = {
      round: 1,
      bracket: { group1: { round1: { progress: 0.5 } } },
      championshipBracket: {},
    };
    renderWithState(state);
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('50%');
  });

  it('renders with 100% progress', () => {
    const state = {
      round: 1,
      bracket: { group1: { round1: { progress: 1 } } },
      championshipBracket: {},
    };
    renderWithState(state);
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('100%');
  });

  it('renders with 33% progress', () => {
    const state = {
      round: 1,
      bracket: { group1: { round1: { progress: 0.333 } } },
      championshipBracket: {},
    };
    renderWithState(state);
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('33%');
  });
});
