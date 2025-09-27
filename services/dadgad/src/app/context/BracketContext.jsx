"use client";
import { createContext, useReducer } from 'react';
import { updateUserBracketLocalStorage } from '../services/userBracketLocalStorage';

export const Context = createContext();

const initialState = {
  values: [],
  bracket: {},
  userBracket: [],
  championshipBracket: {},
  round: 1,
  roundTotal: 1,
  currentRoundProgres: 0,
  currentRound: 0,
  selectedGroup: 'all',
  nonGroupPlay: false,
  finalFour: false,
  finalTwo: false,
  champion: undefined,
  groups: [
    { id: 1, name: 'group1', progress: null },
    { id: 2, name: 'group2', progress: null },
    { id: 3, name: 'group3', progress: null },
    { id: 4, name: 'group4', progress: null },
  ],
};

function bracketReducer(state, action) {
  switch (action.type) {
    case 'setValues': {
      return {
        ...state,
        values: action.payload.values,
      };
    };
    case 'setCurrentRound': {
      return {
        ...state,
        currentRound: action.payload.currentRound,
      };
    };
    case 'setUserBracket': {
      updateUserBracketLocalStorage(action.payload.userBracket);
      return {
        ...state,
        userBracket: localStorage.getItem('userBracket') ? JSON.parse(localStorage.getItem('userBracket')) : action.payload.userBracket,
      }
    };
    case 'setBracket':
      return {
        ...state,
        bracket: action.payload.bracket,
      };
    case 'setRound':
      return {
        ...state,
        round: action.payload.round,
        roundTotal: Math.max(state.roundTotal, action.payload.round),
      };
    case 'setCurrentRoundProgres':
      return {
        ...state,
        currentRoundProgres: action.payload.currentRoundProgres === 1 ? '0' : action.payload.currentRoundProgres,
      };
    case 'setSelectedGroup':
      return {
        ...state,
        selectedGroup: action.payload.selectedGroup,
      };
    case 'setNonGroupPlay':
      return {
        ...state,
        nonGroupPlay: action.payload.nonGroupPlay,
      };
    case 'setFinalFour':
      return {
        ...state,
        finalFour: action.payload.finalFour,
      };
    case 'setFinalTwo':
      return {
        ...state,
        finalTwo: action.payload.finalTwo,
      };
    case 'setChampionshipBracket':
      return {
        ...state,
        championshipBracket: action.payload.championshipBracket,
      };
    case 'setChampion':
      return {
        ...state,
        champion: action.payload.champion,
      }
    default:
      return state;
  }
}

export const BracketContext = ({ children }) => {
  const [state, dispatch] = useReducer(bracketReducer, initialState);
  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
}
