"use client"
import { React, useContext, useEffect } from 'react';

import { Context } from '../context/BracketContext';
import BracketTable from './BracketTable';

// JSON Server API
import { useGetArtistInfoQuery, useCreateBracketMutation } from '../services/jsonServerApi';

import Loading from './Loading';
import { useParams } from 'next/navigation';
import SongCardSkeleton from './skeleton_loaders/SongCardSkeleton';
import CheckIsIos from '../services/CheckIsIos';
import WarningMessage from './WarningMessage';
import {checkForArtistBracket} from '../services/userBracketLocalStorage';
import InProgressBracket from './song_list/InProgressBracket';
import { useSelector, useDispatch } from 'react-redux';
import { setBracket, setTopSongs, setArtistDetails } from '../features/bracket/bracketSlice';

function ArtistPageForm() {
  const { handle } = useParams();
  const dispatch = useDispatch();
  const state = useSelector(state => state.bracket);
  const [createBracket, { data: matchups, isLoading }] = useCreateBracketMutation();

  // generateBracket only runs on initial build of a bracket
  const generateBracket = () => {
    createBracket({ songs: state.topSongs.slice(0, 64), currentRound: state.round, matchupRound: `round${state.round}` });
  };

  useEffect(() => {
    if (matchups) {
      // dispatch({ type: 'setBracket', payload: { bracket: matchups } });
      dispatch(setBracket(matchups));
    }
  }, [matchups]);

  const CheckLocalBrackets = () => {
    // Check brackets in local storage.
    const localBrackets = JSON.parse(localStorage.getItem("userBracket"));
    let initialLocalBracketCheck = checkForArtistBracket(handle, localBrackets);
    if (initialLocalBracketCheck) {
      return <InProgressBracket />
    }
  }

  useEffect(() => {
    const saveInterval = setInterval(() => {
        try {
          if (Object.keys(state.bracket).length === 0) {
            return;
          }
          dispatch({ type: 'setUserBracket', payload: { userBracket: {artist: handle, bracket: state.bracket, round: state.round, currentRoundProgres: state.currentRoundProgres}}});
        } catch (error) {
          console.error("Error saving to local storage:", error);
        }
    }, 10000);

    return () => clearInterval(saveInterval);
  }, [state]);

  const {
    data: musicQuery = {},
  } = useGetArtistInfoQuery(handle);

  useEffect(() => {
    if (Object.keys(musicQuery).length > 0) {
      dispatch(setTopSongs(musicQuery));
      dispatch(setArtistDetails(musicQuery));
    }
  }, [musicQuery]);

  if (!musicQuery.top_songs_list) {
    return (
      <div className='container mx-auto'>
        <Loading message="Loading artist list of songs..." />
        <SongCardSkeleton />
        <SongCardSkeleton />
        <SongCardSkeleton />
        <SongCardSkeleton />
      </div>
    );
  }

  return (
    <div>
      {
        musicQuery.top_songs_list.length > 0 && Object.keys(state.bracket).length === 0
          ? (
            <>
              <p>
                We have determined these to be the top songs for this artist.
              </p>
              {
                CheckIsIos() ? <WarningMessage message={"This feature may not work as expected on iOS devices. We are actively working to improve this experience"} /> : null
              }
              <button type="button" className="btn btn-primary" onClick={generateBracket} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Bracket'}
              </button>
              <CheckLocalBrackets />
            </>
          )
          : <BracketTable />
      }
    </div>
  );
}

export default ArtistPageForm;
