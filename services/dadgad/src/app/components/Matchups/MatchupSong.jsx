"use client";
import { React, useContext, useState } from 'react';
import { useParams } from 'next/navigation';
import PropTypes from 'prop-types';

import MatchupSongButton from './MatchupSongButton';
import { Context } from '../../context/BracketContext';

import axios from 'axios';
import { apiBaseUrl } from '../../services/envConfig';
import { useSession } from '../../context/SessionContext';
import { applySessionBracketState } from '../../services/bracketSessionService';

export default function MatchupSong({
  thissong, opponent, matchupId, round, group, winner,
}) {
  const { handle } = useParams();
  const { sessionId } = useSession();
  const [state, dispatch] = useContext(Context);
  const [boxShadow, setBoxShadow] = useState('none');
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelectMatchupWinner = async () => {
    const response = await axios.post(
      `${apiBaseUrl}/api/brackets/select-matchup-winner/`,
      {
        selectedSong: thissong,
        opponentSong: opponent,
        matchupId: matchupId,
        round: round,
        group: group,
        winner: winner,
        sessionId: sessionId,
      },
      { withCredentials: true },
    );
    applySessionBracketState(dispatch, response.data, state.values.top_songs_list);
    return response;
  };

  const selectWinner = async () => {
    setIsSelecting(true);
    try {
      await handleSelectMatchupWinner();
      dispatch({
        type: 'setUserBracket',
        payload: {
          userBracket: {
            artist: handle,
            bracket: state.bracket,
            round: state.round,
            currentRoundProgres: state.currentRoundProgres,
          },
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSelecting(false);
    }
  };

  winner = typeof (winner) !== "undefined" ? winner.id : null

  return (
    <MatchupSongButton
      thissong={thissong}
      boxShadow={boxShadow}
      setBoxShadow={setBoxShadow}
      selectWinner={selectWinner}
      winner={winner}
      isSelecting={isSelecting}
    />
  );
}

MatchupSong.propTypes = {
  thissong: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      artwork: PropTypes.shape({
        textColor1: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  opponent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    attributes: PropTypes.shape({
      name: PropTypes.string.isRequired,
      albumName: PropTypes.string.isRequired,
      artistName: PropTypes.string.isRequired,
      artwork: PropTypes.shape({
        textColor1: PropTypes.string.isRequired,
        bgColor: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};
