"use client"
import { React, useContext, useEffect, useState } from 'react';

import { Context } from '../context/BracketContext';
import BracketTable from './BracketTable';
import { useGetArtistPageQuery } from '../services/jsonServerApi';
import Loading from './Loading';
import { useParams } from 'next/navigation';
import SongCardSkeleton from './skeleton_loaders/SongCardSkeleton';
import CheckIsIos from '../services/CheckIsIos';
import WarningMessage from './WarningMessage';
import { checkForArtistBracket, clearArtistBracketLocalStorage } from '../services/userBracketLocalStorage';
import InProgressBracket from './song_list/InProgressBracket';
import { useSession } from '../context/SessionContext';
import {
  applySessionBracketState,
  resetSessionBracket,
} from '../services/bracketSessionService';

function ArtistPageForm() {
  const { handle } = useParams();
  const value = useContext(Context);
  const [state, dispatch] = value;
  const { sessionId, loading: sessionLoading } = useSession();
  const [generating, setGenerating] = useState(false);
  const [localBracketExists, setLocalBracketExists] = useState(false);
  const {
    data: musicQuery = {},
  } = useGetArtistPageQuery(handle);

  const refreshLocalBracketFlag = () => {
    const localBrackets = JSON.parse(localStorage.getItem("userBracket")) || [];
    setLocalBracketExists(checkForArtistBracket(handle, localBrackets));
  };

  useEffect(() => {
    refreshLocalBracketFlag();
  }, [handle, state.bracket]);

  const generateBracket = async () => {
    if (!musicQuery.bracket_id || !sessionId) {
      return;
    }

    setGenerating(true);
    try {
      clearArtistBracketLocalStorage(handle);
      const sessionState = await resetSessionBracket(
        musicQuery.bracket_id,
        sessionId,
      );
      applySessionBracketState(dispatch, sessionState, musicQuery.top_songs_list);
      refreshLocalBracketFlag();
    } catch (error) {
      console.error("Failed to reset session bracket:", error);
      clearArtistBracketLocalStorage(handle);
      dispatch({
        type: 'setBracket',
        payload: { bracket: structuredClone(musicQuery.bracket) },
      });
      dispatch({
        type: 'setChampionshipBracket',
        payload: { championshipBracket: {} },
      });
      dispatch({ type: 'setRound', payload: { round: 1 } });
      dispatch({
        type: 'setCurrentRoundProgres',
        payload: { currentRoundProgres: 0 },
      });
      dispatch({ type: 'setChampion', payload: { champion: undefined } });
      refreshLocalBracketFlag();
    } finally {
      setGenerating(false);
    }
  };

  const checkLocalBrackets = () => {
    if (localBracketExists) {
      return <InProgressBracket />;
    }
    return null;
  };

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
  }, [state, dispatch, handle]);

  useEffect(() => {
    if (Object.keys(musicQuery).length > 0) {
      dispatch({ type: 'setValues', payload: { values: musicQuery } });
    }
  }, [musicQuery, dispatch]);

  const songLengthMessage = () => (state.values.top_songs_list.length < 64 ? <WarningMessage message='Available tracks for this artist is a bit short, there may be potential bugs in the bracket generating process' /> : null);

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
              <button
                type="button"
                className="btn btn-primary"
                onClick={generateBracket}
                disabled={generating || sessionLoading || !sessionId}
              >
                {generating ? 'Generating...' : 'Generate Bracket'}
              </button>
              {checkLocalBrackets()}            
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
