"use client"
import { React, useContext, useEffect } from 'react';

import { Context } from '../context/BracketContext';
import BracketTable from './BracketTable';
import { useGetArtistInfoQuery } from '../services/jsonServerApi';
import Loading from './Loading';
import { useParams } from 'next/navigation';
import SongCardSkeleton from './skeleton_loaders/SongCardSkeleton';
import CheckIsIos from '../services/CheckIsIos';
import WarningMessage from './WarningMessage';
import {checkForArtistBracket} from '../services/userBracketLocalStorage';
import InProgressBracket from './song_list/InProgressBracket';
import { createMatchups } from '../services/createBracket';

function ArtistPageForm() {
  const { handle } = useParams();
  const value = useContext(Context);
  const [state, dispatch] = value;

  // generateBracket only runs on initial build of a bracket.
  const generateBracket = () => {
    const matchups = createMatchups(state.values.top_songs_list.slice(0, 64), 1, `round${state.round}`);
    dispatch({ type: 'setBracket', payload: { bracket: matchups } });
  };

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
      dispatch({ type: 'setValues', payload: { values: musicQuery } });
    }
  }, [musicQuery]);

  const songLengthMessage = () => (state.values.top_songs_list.length < 64 ? 'Available tracks for this artist is a bit short, there may be potential bugs in the bracket generating process' : null);

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
        Object.keys(state.bracket).length === 0
          ? (
            <>
              <p>
                We have determined these to be the top songs for this artist.
              </p>
              {
                CheckIsIos() ? <WarningMessage message={"This feature may not work as expected on iOS devices. We are actively working to improve this experience"} /> : null
              }
              <button type="button" className="btn btn-primary" onClick={generateBracket}>
                Generate Bracket
              </button>
              <CheckLocalBrackets />            
              <div className="my-3 fst-italic">
                {
                    Object.keys(state.values).length !== 0
                      ? (
                        songLengthMessage()
                      )
                      : null
                }
              </div>
            </>
          )
          : <BracketTable />
      }
    </div>
  );
}

export default ArtistPageForm;
