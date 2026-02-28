import React, { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { BracketContext, Context } from '../context/BracketContext';
import { updateUserBracketLocalStorage } from '../services/userBracketLocalStorage';

jest.mock('../services/userBracketLocalStorage', () => ({
  updateUserBracketLocalStorage: jest.fn(),
}));

const TestHarness = ({ action }) => {
  const [state, dispatch] = useContext(Context);

  return (
    <div>
      <button data-testid="dispatch-action" onClick={() => dispatch(action)}>
        Dispatch
      </button>
      <pre data-testid="state">{JSON.stringify(state)}</pre>
    </div>
  );
};

const renderHarness = (action) =>
  render(
    <BracketContext>
      <TestHarness action={action} />
    </BracketContext>
  );

const getState = () => JSON.parse(screen.getByTestId('state').textContent);

describe('BracketContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('provides the initial reducer state', () => {
    renderHarness({ type: 'unknown-action' });
    const state = getState();

    expect(state.values).toEqual([]);
    expect(state.bracket).toEqual({});
    expect(state.userBracket).toEqual([]);
    expect(state.round).toBe(1);
    expect(state.roundTotal).toBe(1);
    expect(state.currentRoundProgres).toBe(0);
    expect(state.currentRound).toBe(0);
    expect(state.selectedGroup).toBe('all');
    expect(state.nonGroupPlay).toBe(false);
    expect(state.finalFour).toBe(false);
    expect(state.finalTwo).toBe(false);
    expect(state.championshipBracket).toEqual({});
    expect(state.groups).toHaveLength(4);
  });

  it('handles setValues', () => {
    renderHarness({ type: 'setValues', payload: { values: ['a', 'b'] } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().values).toEqual(['a', 'b']);
  });

  it('handles setCurrentRound', () => {
    renderHarness({ type: 'setCurrentRound', payload: { currentRound: 3 } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().currentRound).toBe(3);
  });

  it('handles setUserBracket using persisted localStorage value', () => {
    updateUserBracketLocalStorage.mockImplementation((nextBracket) => {
      localStorage.setItem(
        'userBracket',
        JSON.stringify([{ ...nextBracket, persisted: true }])
      );
    });

    const payloadUserBracket = { artist: 'alpha', round: 2 };
    renderHarness({
      type: 'setUserBracket',
      payload: { userBracket: payloadUserBracket },
    });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(updateUserBracketLocalStorage).toHaveBeenCalledWith(payloadUserBracket);
    expect(getState().userBracket).toEqual([
      { artist: 'alpha', round: 2, persisted: true },
    ]);
  });

  it('handles setUserBracket fallback when localStorage is empty', () => {
    updateUserBracketLocalStorage.mockImplementation(() => {});

    const payloadUserBracket = { artist: 'beta', round: 4 };
    renderHarness({
      type: 'setUserBracket',
      payload: { userBracket: payloadUserBracket },
    });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(updateUserBracketLocalStorage).toHaveBeenCalledWith(payloadUserBracket);
    expect(getState().userBracket).toEqual(payloadUserBracket);
  });

  it('handles setBracket', () => {
    const bracket = { 'round-1': ['song-a'] };
    renderHarness({ type: 'setBracket', payload: { bracket } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().bracket).toEqual(bracket);
  });

  it('handles setRound and updates roundTotal with max value', () => {
    renderHarness({ type: 'setRound', payload: { round: 4 } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    const state = getState();
    expect(state.round).toBe(4);
    expect(state.roundTotal).toBe(4);
  });

  it('handles setCurrentRoundProgres when payload is 1', () => {
    renderHarness({
      type: 'setCurrentRoundProgres',
      payload: { currentRoundProgres: 1 },
    });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().currentRoundProgres).toBe('0');
  });

  it('handles setCurrentRoundProgres when payload is not 1', () => {
    renderHarness({
      type: 'setCurrentRoundProgres',
      payload: { currentRoundProgres: 0.75 },
    });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().currentRoundProgres).toBe(0.75);
  });

  it('handles setSelectedGroup', () => {
    renderHarness({ type: 'setSelectedGroup', payload: { selectedGroup: 'group3' } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().selectedGroup).toBe('group3');
  });

  it('handles setNonGroupPlay', () => {
    renderHarness({ type: 'setNonGroupPlay', payload: { nonGroupPlay: true } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().nonGroupPlay).toBe(true);
  });

  it('handles setFinalFour', () => {
    renderHarness({ type: 'setFinalFour', payload: { finalFour: true } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().finalFour).toBe(true);
  });

  it('handles setFinalTwo', () => {
    renderHarness({ type: 'setFinalTwo', payload: { finalTwo: true } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().finalTwo).toBe(true);
  });

  it('handles setChampionshipBracket', () => {
    const championshipBracket = { finals: ['song-a', 'song-b'] };
    renderHarness({
      type: 'setChampionshipBracket',
      payload: { championshipBracket },
    });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().championshipBracket).toEqual(championshipBracket);
  });

  it('handles setChampion', () => {
    renderHarness({ type: 'setChampion', payload: { champion: 'song-a' } });

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState().champion).toBe('song-a');
  });

  it('returns previous state for unknown action type', () => {
    renderHarness({ type: 'totally-unknown' });
    const before = getState();

    fireEvent.click(screen.getByTestId('dispatch-action'));

    expect(getState()).toEqual(before);
  });
});
