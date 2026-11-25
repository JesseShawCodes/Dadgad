"use client";

import {
  createContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { updateUserBracketLocalStorage } from '../services/userBracketLocalStorage';
import type {
  ArtistPagePayload,
  ChampionshipBracket,
  ChampionState,
  GroupBracket,
} from '../api/types';

export type BracketGroupMeta = {
  id: number;
  name: string;
  progress: number | null;
};

export type BracketState = {
  values: ArtistPagePayload | Record<string, never> | unknown[];
  bracket: GroupBracket;
  userBracket: unknown[];
  championshipBracket: ChampionshipBracket;
  round: number;
  roundTotal: number;
  currentRoundProgres: number | string;
  currentRound: number;
  selectedGroup: string;
  nonGroupPlay: boolean;
  finalFour: boolean;
  finalTwo: boolean;
  champion: ChampionState | undefined;
  groups: BracketGroupMeta[];
};

export type BracketAction =
  | { type: 'setValues'; payload: { values: BracketState['values'] } }
  | { type: 'setCurrentRound'; payload: { currentRound: number } }
  | { type: 'setUserBracket'; payload: { userBracket: unknown } }
  | { type: 'setBracket'; payload: { bracket: GroupBracket } }
  | { type: 'setRound'; payload: { round: number } }
  | { type: 'setCurrentRoundProgres'; payload: { currentRoundProgres: number | string } }
  | { type: 'setSelectedGroup'; payload: { selectedGroup: string } }
  | { type: 'setNonGroupPlay'; payload: { nonGroupPlay: boolean } }
  | { type: 'setFinalFour'; payload: { finalFour: boolean } }
  | { type: 'setFinalTwo'; payload: { finalTwo: boolean } }
  | { type: 'setChampionshipBracket'; payload: { championshipBracket: ChampionshipBracket } }
  | { type: 'setChampion'; payload: { champion: ChampionState | undefined } };

export type BracketContextValue = [BracketState, Dispatch<BracketAction>];

export const Context = createContext<BracketContextValue | undefined>(undefined);

export const initialState: BracketState = {
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

export function bracketReducer(state: BracketState, action: BracketAction): BracketState {
  switch (action.type) {
    case 'setValues':
      return {
        ...state,
        values: action.payload.values,
      };
    case 'setCurrentRound':
      return {
        ...state,
        currentRound: action.payload.currentRound,
      };
    case 'setUserBracket': {
      updateUserBracketLocalStorage(action.payload.userBracket);
      return {
        ...state,
        userBracket: localStorage.getItem('userBracket')
          ? JSON.parse(localStorage.getItem('userBracket') as string)
          : (action.payload.userBracket as unknown[]),
      };
    }
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
        currentRoundProgres:
          action.payload.currentRoundProgres === 1
            ? '0'
            : action.payload.currentRoundProgres,
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
      };
    default:
      return state;
  }
}

export function BracketContext({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bracketReducer, initialState);
  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
}
