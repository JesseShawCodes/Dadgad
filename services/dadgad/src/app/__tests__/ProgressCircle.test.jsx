import React from 'react';
import { render, screen } from '@testing-library/react';
import { Context } from '../context/BracketContext';
import ProgressCircle from '../components/ProgressCircle';

describe('ProgressCircle', () => {
  it('renders with 0% progress', () => {
    const state = { currentRoundProgres: 0 };
    render(
      <Context.Provider value={[state]}>
        <ProgressCircle />
      </Context.Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('0%');
  });

  it('renders with 50% progress', () => {
    const state = { currentRoundProgres: 0.5 };
    render(
      <Context.Provider value={[state]}>
        <ProgressCircle />
      </Context.Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('50%');
  });

  it('renders with 100% progress', () => {
    const state = { currentRoundProgres: 1 };
    render(
      <Context.Provider value={[state]}>
        <ProgressCircle />
      </Context.Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('100%');
  });

  it('renders with 33% progress', () => {
    const state = { currentRoundProgres: 0.333 };
    render(
      <Context.Provider value={[state]}>
        <ProgressCircle />
      </Context.Provider>
    );
    expect(screen.getByTestId('progress-circle-label')).toHaveTextContent('33%');
  });
});
