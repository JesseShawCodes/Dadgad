/**
 * @file This file contains tests for the InProgressBracket component.
 * @summary The tests in this file verify that the InProgressBracket component renders correctly and that its functionality works as expected.
 * @description The tests use mock data and functions to simulate the component's behavior in a controlled environment.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import InProgressBracket from "../components/song_list/InProgressBracket";
import { Context } from '../context/BracketContext';

// Mock the 'next/navigation' module to provide a consistent 'useParams' hook for tests.
jest.mock('next/navigation', () => ({
  useParams: () => ({ handle: 'test-artist' }),
}));

// Create a mock implementation of the browser's localStorage.
const localStorageMock = {
  store: {
    // Pre-populate the store with a sample user bracket.
    userBracket: JSON.stringify([
      {
        artist: 'test-artist',
        round: 2,
        bracket: {
          "round-1": [],
          "round-2": [],
        },
        currentRoundProgres: 50,
      },
    ]),
  },
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
};

// Replace the window's localStorage with our mock implementation.
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Define a test suite for the 'In Progress Bracket Message' functionality.
describe('In Progress Bracket Message', () => {
  // Define a test case for rendering the component and handling a button click.
  it('renders the Inprogress Bracket Component and handles button click', () => {
    // Create a mock dispatch function to spy on actions.
    const dispatch = jest.fn();
    const state = {}; // Initial state for the context.
    const value = [state, dispatch];

    // Render the component within a context provider.
    render(
      <Context.Provider value={value}>
        <InProgressBracket />
      </Context.Provider>
    );

    // Assert that the initial message is visible to the user.
    expect(screen.getByText('You currently have a bracket in progress for this artist.')).toBeInTheDocument();
    
    // Find the button and assert that it is rendered.
    const button = screen.getByText('Show In Progress Bracket');
    expect(button).toBeInTheDocument();

    // Simulate a user clicking the button.
    fireEvent.click(button);

    // Assert that the 'setRound' action was dispatched with the correct payload.
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setRound',
      payload: { round: 2 },
    });

    // Assert that the 'setBracket' action was dispatched with the correct bracket data.
    expect(dispatch).toHaveBeenCalledWith({
      type: 'setBracket',
      payload: {
        bracket: {
          "round-1": [],
          "round-2": [],
        },
      },
    });

    // Assert that the 'setCurrentRoundProgres' action was dispatched with the correct progress.
    expect(dispatch).toHaveBeenCalledWith({
        type: 'setCurrentRoundProgres',
        payload: { currentRoundProgres: 50 },
    });
  });
});
