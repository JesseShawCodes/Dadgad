import { progressCalculation } from "@/app/services/progressCalculationService";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  values: [],
  bracket: {},
  userBracket: [],
  championshipBracket: {},
  round: 1,
  roundTotal: 1,
  currentRound: 0,
  selectedGroup: 'all',
  nonGroupPlay: false,
  finalFour: false,
  finalTwo: false,
  champion: undefined,
  progress: 0,
  groups: [
    { id: 1, name: 'group1', progress: null },
    { id: 2, name: 'group2', progress: null },
    { id: 3, name: 'group3', progress: null },
    { id: 4, name: 'group4', progress: null },
  ],
};

const bracketSlice = createSlice({
  name: 'bracket',
  initialState,
  reducers: {
    setBracket(state, action) {
      state.bracket = action.payload;
    },
    clearBracket(state) {
      state.bracket = null;
    },
    setTopSongs(state, action) {
      state.topSongs = action.payload.top_songs_list;
    },
    setMatchupWinner(state, action) {
      // 1. Destructure payload for clarity
      const { group, index, winner, loser, round } = action.payload;

      // 2. Assign the target object to a short variable
      const targetMatchup = state.bracket[group][round].roundMatchups[index].attributes;
        
      // 3. Update properties on the short variable
      targetMatchup.winner = winner;
      targetMatchup.loser = loser;

      const targetRound = state.bracket[group][round];
      const totalMatchups = Object.values(state.bracket).reduce((acc, group) => acc + group.round1.roundMatchups.length, 0);
      const completedMatchups = Object.values(state.bracket).reduce((acc, group) => {
        const roundMatchups = group.round1.roundMatchups;
        return acc + roundMatchups.filter(m => m.attributes.winner).length;
      }, 0);

      state.progress = completedMatchups / totalMatchups;

      // 4. Update state properties
      state.bracket[group][round] = targetRound;
    },
    setArtistDetails(state, action) {

      // Destructure payload for clarity
      const { artist_name, artist_id, artist_image } = action.payload;

      console.log(action.payload);

      console.log("setArtistDetails");
      state.artist_name = artist_name;
    },
    setRoundProgress(state, action) {
      console.log("Set Round Progress");
    }
  }
})

export const { setBracket, clearBracket, setTopSongs, setMatchupWinner, setRoundProgress, setArtistDetails } = bracketSlice.actions;
export default bracketSlice.reducer;
